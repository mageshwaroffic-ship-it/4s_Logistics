import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Users,
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Building2,
    Phone,
    Mail,
    FileText
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:8000/api";

interface Customer {
    id: number;
    tenant_id: number;
    company_name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    gst_no: string | null;
    created_at: string;
}

const emptyForm = {
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    gst_no: "",
};

const Customers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    // Get tenant_id from localStorage
    const getTenantId = () => {
        const tenant = localStorage.getItem("4s_tenant");
        if (tenant) {
            return JSON.parse(tenant).id;
        }
        return null;
    };

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            const tenantId = getTenantId();
            const url = tenantId
                ? `${API_URL}/customers?tenant_id=${tenantId}`
                : `${API_URL}/customers`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setCustomers(data.customers || []);
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter customers based on search
    const filteredCustomers = customers.filter(customer =>
        customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.gst_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Open dialog for add/edit
    const openDialog = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setForm({
                company_name: customer.company_name,
                contact_person: customer.contact_person || "",
                phone: customer.phone || "",
                email: customer.email || "",
                gst_no: customer.gst_no || "",
            });
        } else {
            setEditingCustomer(null);
            setForm(emptyForm);
        }
        setIsDialogOpen(true);
    };

    // Save customer (create or update)
    const handleSave = async () => {
        if (!form.company_name.trim()) {
            toast.error("Company name is required");
            return;
        }

        setIsSaving(true);
        try {
            const tenantId = getTenantId();

            if (editingCustomer) {
                // Update
                const response = await fetch(`${API_URL}/customers/${editingCustomer.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });

                if (!response.ok) throw new Error("Failed to update customer");
                toast.success("Customer updated successfully");
            } else {
                // Create
                const response = await fetch(`${API_URL}/customers`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...form,
                        tenant_id: tenantId,
                    }),
                });

                if (!response.ok) throw new Error("Failed to create customer");
                toast.success("Customer created successfully");
            }

            setIsDialogOpen(false);
            fetchCustomers();
        } catch (error) {
            toast.error(editingCustomer ? "Failed to update customer" : "Failed to create customer");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete customer
    const handleDelete = async () => {
        if (!deletingCustomer) return;

        try {
            const response = await fetch(`${API_URL}/customers/${deletingCustomer.id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete customer");

            toast.success("Customer deleted successfully");
            setIsDeleteDialogOpen(false);
            setDeletingCustomer(null);
            fetchCustomers();
        } catch (error) {
            toast.error("Failed to delete customer");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-7 w-7 text-blue-600" />
                        Customers
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your importers and exporters</p>
                </div>
                <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{customers.length}</p>
                                <p className="text-sm text-gray-500">Total Customers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{customers.filter(c => c.gst_no).length}</p>
                                <p className="text-sm text-gray-500">With GST</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Customer List</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading customers...</div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery ? "No customers found matching your search" : "No customers yet. Add your first customer!"}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>GST No.</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">{customer.company_name}</TableCell>
                                        <TableCell>{customer.contact_person || "-"}</TableCell>
                                        <TableCell>
                                            {customer.phone ? (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 text-gray-400" />
                                                    {customer.phone}
                                                </div>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {customer.email ? (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    {customer.email}
                                                </div>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>{customer.gst_no || "-"}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openDialog(customer)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setDeletingCustomer(customer);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCustomer ? "Edit Customer" : "Add New Customer"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCustomer ? "Update customer information" : "Fill in the customer details below"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name *</Label>
                            <Input
                                id="company_name"
                                value={form.company_name}
                                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                placeholder="ABC Trading Co."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_person">Contact Person</Label>
                            <Input
                                id="contact_person"
                                value={form.contact_person}
                                onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="contact@company.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gst_no">GST Number</Label>
                            <Input
                                id="gst_no"
                                value={form.gst_no}
                                onChange={(e) => setForm({ ...form, gst_no: e.target.value })}
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                            {isSaving ? "Saving..." : editingCustomer ? "Update" : "Add Customer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingCustomer?.company_name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Customers;
