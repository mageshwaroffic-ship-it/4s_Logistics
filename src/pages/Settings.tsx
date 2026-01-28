import { useState } from 'react';
import { ClientManager } from "@/components/settings/ClientManager";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function Settings() {
    const [isClientManagerOpen, setIsClientManagerOpen] = useState(false);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage application settings and configurations</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Client Management Card */}
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Client Management</h3>
                            <p className="text-sm text-muted-foreground">Manage importers and client details</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsClientManagerOpen(true)} className="w-full">
                        Manage Clients
                    </Button>
                </div>
            </div>

            <ClientManager
                isOpen={isClientManagerOpen}
                onClose={() => setIsClientManagerOpen(false)}
            />
        </div>
    );
}
