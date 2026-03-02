
import { useState, useCallback, useEffect } from "react";

// Define strict types for window.google
declare global {
    interface Window {
        google: any;
        gapi: any;
    }
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    createdTime?: string;
}

export const useGoogleDrive = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [gapiInited, setGapiInited] = useState(false);
    const [gisInited, setGisInited] = useState(false);

    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

    useEffect(() => {
        // Only load if credentials are provided
        if (!CLIENT_ID || !API_KEY) {
            console.warn("Google Drive credentials missing in .env");
            return;
        }

        const loadGapi = () => {
            const script = document.createElement("script");
            script.src = "https://apis.google.com/js/api.js";
            script.onload = () => {
                window.gapi.load("client", async () => {
                    await window.gapi.client.init({
                        apiKey: API_KEY,
                        discoveryDocs: [DISCOVERY_DOC],
                    });
                    setGapiInited(true);
                });
            };
            document.body.appendChild(script);
        };

        const loadGis = () => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.onload = () => {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: async (resp: any) => {
                        if (resp.error) {
                            console.error(resp);
                            throw resp;
                        }
                        setIsAuthenticated(true);
                    },
                });
                setTokenClient(client);
                setGisInited(true);
            };
            document.body.appendChild(script);
        };

        loadGapi();
        loadGis();
    }, [CLIENT_ID, API_KEY]);

    const handleAuthClick = useCallback(() => {
        if (!tokenClient) return;

        // Check if we already have a token
        if (window.gapi?.client?.getToken() === null) {
            // Prompt safely
            tokenClient.requestAccessToken({ prompt: "consent" });
        } else {
            tokenClient.requestAccessToken({ prompt: "" });
        }
    }, [tokenClient]);

    const uploadFile = async (fileName: string, content: string | Blob, mimeType: string = "application/json"): Promise<GoogleDriveFile | null> => {
        setIsLoading(true);
        try {
            const file = content instanceof Blob ? content : new Blob([content], { type: mimeType });
            const metadata = {
                name: fileName,
                mimeType: mimeType,
            };

            const accessToken = window.gapi.client.getToken().access_token;
            const form = new FormData();
            form.append(
                "metadata",
                new Blob([JSON.stringify(metadata)], { type: "application/json" })
            );
            form.append("file", file);

            const response = await fetch(
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime",
                {
                    method: "POST",
                    headers: new Headers({ Authorization: "Bearer " + accessToken }),
                    body: form,
                }
            );

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Upload error", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFile = async (fileId: string): Promise<any | null> => {
        setIsLoading(true);
        try {
            // We use fetch with alt=media
            const accessToken = window.gapi.client.getToken().access_token;
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    method: "GET",
                    headers: new Headers({ Authorization: "Bearer " + accessToken }),
                }
            );

            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Download error", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFileAsBlob = async (fileId: string): Promise<Blob | null> => {
        setIsLoading(true);
        try {
            const accessToken = window.gapi.client.getToken().access_token;
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    method: "GET",
                    headers: new Headers({ Authorization: "Bearer " + accessToken }),
                }
            );

            if (!response.ok) throw new Error("Network response was not ok");
            return await response.blob();
        } catch (err) {
            console.error("Binary download error", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const listFiles = async (): Promise<GoogleDriveFile[]> => {
        setIsLoading(true);
        try {
            const response = await window.gapi.client.drive.files.list({
                'pageSize': 10,
                'fields': "nextPageToken, files(id, name, mimeType, createdTime)",
                'q': "trashed = false", // basic filter
                'orderBy': 'createdTime desc'
            });
            return response.result.files || [];
        } catch (err) {
            console.error("List files error", err);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isAuthenticated,
        isReady: gapiInited && gisInited,
        isLoading,
        handleAuthClick,
        uploadFile,
        downloadFile,
        downloadFileAsBlob,
        listFiles
    };
};
