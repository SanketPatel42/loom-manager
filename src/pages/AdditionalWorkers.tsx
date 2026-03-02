import {
    useBegariWorkers,
    useTFOWorkers,
    useTFOAttendance,
    useBobbinWorkers,
    useBobbinAttendance,
    useMasterWorkers,
    useWiremanWorkers,
    useWiremanBills,
} from "@/hooks/useAsyncStorage";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BegariWorkersSection,
    TFOWorkersSection,
    BobbinWorkersSection,
    MasterWorkersSection,
    WiremanWorkersSection,
} from "./additional-workers";

export default function AdditionalWorkersManagement() {
    const { data: begariWorkers = [], loading: bl } = useBegariWorkers();
    const { data: tfoWorkers = [], loading: tl } = useTFOWorkers();
    const { data: tfoAttendance = [], loading: tal } = useTFOAttendance();
    const { data: bobbinWorkers = [], loading: bwl } = useBobbinWorkers();
    const { data: bobbinAttendance = [], loading: bal } = useBobbinAttendance();
    const { data: masterWorkers = [], loading: ml } = useMasterWorkers();
    const { data: wiremanWorkers = [], loading: wl } = useWiremanWorkers();
    const { data: wiremanBills = [], loading: wbl } = useWiremanBills();

    const loading = bl || tl || tal || bwl || bal || ml || wl || wbl;

    return (
        <div className="container mx-auto py-6 px-4 relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Loading workers data...</p>
                    </div>
                </div>
            )}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Additional Workers Management</h1>
                <p className="text-muted-foreground">
                    Manage Begari, TFO, Bobbin, Master, and Wireman workers
                </p>
            </div>

            <Tabs defaultValue="begari" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="begari">Begari Workers</TabsTrigger>
                    <TabsTrigger value="tfo">TFO Workers</TabsTrigger>
                    <TabsTrigger value="bobbin">Bobbin Workers</TabsTrigger>
                    <TabsTrigger value="master">Master Workers</TabsTrigger>
                    <TabsTrigger value="wireman">Wireman</TabsTrigger>
                </TabsList>

                <TabsContent value="begari" className="space-y-4">
                    <BegariWorkersSection workers={begariWorkers} />
                </TabsContent>

                <TabsContent value="tfo" className="space-y-4">
                    <TFOWorkersSection workers={tfoWorkers} attendance={tfoAttendance} />
                </TabsContent>

                <TabsContent value="bobbin" className="space-y-4">
                    <BobbinWorkersSection workers={bobbinWorkers} attendance={bobbinAttendance} />
                </TabsContent>

                <TabsContent value="master" className="space-y-4">
                    <MasterWorkersSection workers={masterWorkers} />
                </TabsContent>

                <TabsContent value="wireman" className="space-y-4">
                    <WiremanWorkersSection workers={wiremanWorkers} bills={wiremanBills} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
