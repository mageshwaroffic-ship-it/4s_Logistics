import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { clientService, Client } from '@/services/clientService';

interface ClientManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (client: Client) => void;
}

export function ClientManager({ isOpen, onClose, onSelect }: ClientManagerProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    // Edit/Create State
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        contact_person: ''
    });

    // Fetch clients on open
    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await clientService.getAll();
            setClients(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load clients",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast({ title: "Error", description: "Name is required", variant: "destructive" });
            return;
        }

        try {
            if (editingClient) {
                await clientService.update(editingClient.id, formData);
                toast({ title: "Success", description: "Client updated" });
            } else {
                await clientService.create(formData);
                toast({ title: "Success", description: "Client created" });
            }
            setIsFormOpen(false);
            setEditingClient(null);
            fetchClients();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this client?")) return;
        try {
            await clientService.delete(id);
            toast({ title: "Success", description: "Client deleted" });
            fetchClients();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete",
                variant: "destructive"
            });
        }
    };

    const openForm = (client?: Client) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name,
                address: client.address || '',
                email: client.email || '',
                phone: client.phone || '',
                contact_person: client.contact_person || ''
            });
        } else {
            setEditingClient(null);
            setFormData({ name: '', address: '', email: '', phone: '', contact_person: '' });
        }
        setIsFormOpen(true);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isFormOpen) {
        return (
            <Dialog open={true} onOpenChange={() => setIsFormOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Company Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Contact Person</Label>
                                <Input
                                    value={formData.contact_person}
                                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Clients</DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-between gap-4 py-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search clients..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => openForm()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Client
                    </Button>
                </div>

                <div className="flex-1 overflow-auto border rounded-md">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="divide-y">
                            {filteredClients.map(client => (
                                <div key={client.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                                    <div
                                        className="cursor-pointer flex-1"
                                        onClick={() => onSelect?.(client)}
                                    >
                                        <p className="font-medium">{client.name}</p>
                                        {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openForm(client)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(client.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {filteredClients.length === 0 && (
                                <div className="text-center p-8 text-muted-foreground">No clients found</div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
