import { useState, useCallback, useEffect } from "react";

// Electron-specific Google Drive hook
export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    createdTime?: string;
}

export const useGoogleDriveElectron = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

    // Check if we're running in Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI;

    useEffect(() => {
        if (!CLIENT_ID || !API_KEY) {
            console.warn("Google Drive credentials missing in .env");
            return;
        }

        // Check for existing token
        const savedToken = localStorage.getItem('google_access_token');
        if (savedToken) {
            setAccessToken(savedToken);
            setIsAuthenticated(true);
        }
    }, [CLIENT_ID, API_KEY]);

    const handleAuthClick = useCallback(async () => {
        if (!isElectron) {
            console.error("This hook is for Electron only");
            return;
        }

        try {
            setIsLoading(true);
            
            // Use Electron's OAuth flow
            const token = await window.electronAPI.googleAuth({
                clientId: CLIENT_ID,
                scopes: ['https://www.googleapis.com/auth/drive.file']
            });

            if (token) {
                setAccessToken(token);
                setIsAuthenticated(true);
                localStorage.setItem('google_access_token', token);
            }
        } catch (error) {
            console.error('OAuth error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [CLIENT_ID, isElectron]);

    const uploadFile = async (fileName: string, content: string | Blob, mimeType: string = "application/json"): Promise<GoogleDriveFile | null> => {
        if (!accessToken) return null;

        setIsLoading(true);
        try {
            const file = content instanceof Blob ? content : new Blob([content], { type: mimeType });
            const metadata = {
                name: fileName,
                mimeType: mimeType,
            };

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
        if (!accessToken) return null;

        setIsLoading(true);
        try {
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
        if (!accessToken) return null;

        setIsLoading(true);
        try {
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
        if (!accessToken) return [];

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://www.googleapis.com/discovery/v1/apis/drive/v3/rest`,
                {
                    headers: { Authorization: "Bearer " + accessToken }
                }
            );

            if (!response.ok) throw new Error("Failed to load Drive API");

            const listResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?pageSize=10&fields=nextPageToken,files(id,name,mimeType,createdTime)&q=trashed=false&orderBy=createdTime desc`,
                {
                    headers: { Authorization: "Bearer " + accessToken }
                }
            );

            const data = await listResponse.json();
            return data.files || [];
        } catch (err) {
            console.error("List files error", err);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = () => {
        setAccessToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('google_access_token');
    };

    return {
        isAuthenticated,
        isReady: true,
        isLoading,
        handleAuthClick,
        uploadFile,
        downloadFile,
        downloadFileAsBlob,
        listFiles,
        signOut
    };
};