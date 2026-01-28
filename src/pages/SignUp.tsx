import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Zap,
    ArrowRight,
    CheckCircle2,
    FileText,
    FileSpreadsheet,
    Upload,
    Database
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:8000/api";

const SignUp = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [form, setForm] = useState({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        password: "",
    });

    const benefits = [
        { icon: <FileText className="h-5 w-5" />, text: "Bill of Lading Processing" },
        { icon: <FileSpreadsheet className="h-5 w-5" />, text: "BOE Data Extraction" },
        { icon: <Upload className="h-5 w-5" />, text: "Invoice Automation" },
        { icon: <Database className="h-5 w-5" />, text: "Packing List Parsing" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreedToTerms) {
            toast.error("Please agree to the Terms of Service");
            return;
        }

        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            // Create tenant with password - backend auto-creates admin user
            console.log("Creating tenant with password...");
            const tenantResponse = await fetch(`${API_URL}/tenants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company_name: form.company_name,
                    contact_name: form.contact_name,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,  // Password is now sent to tenant endpoint
                    plan: "trial",
                }),
            });

            if (!tenantResponse.ok) {
                const error = await tenantResponse.json();
                throw new Error(error.detail || "Registration failed");
            }

            const tenant = await tenantResponse.json();
            console.log("Tenant and user created:", tenant);

            // Store session (user was auto-created with same email/password)
            localStorage.setItem("4s_tenant", JSON.stringify(tenant));
            localStorage.setItem("4s_user", JSON.stringify({
                email: form.email,
                name: form.contact_name,
                role: "admin",
                tenant_id: tenant.id
            }));

            toast.success("🎉 Welcome to BoostEntry! Your 15-day free trial has started.");
            navigate("/");
        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Benefits */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-12 flex-col justify-between">
                <div>
                    {/* Logo */}
                    <Link to="/welcome" className="flex items-center gap-2 mb-16">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold">BoostEntry</span>
                    </Link>

                    {/* Content */}
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold mb-6">
                            Start Automating Your Documents Today
                        </h1>
                        <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                            Join 50+ companies saving hours every day with AI-powered document processing.
                        </p>

                        {/* Benefits List */}
                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        {benefit.icon}
                                    </div>
                                    <span className="font-medium">{benefit.text}</span>
                                    <CheckCircle2 className="h-5 w-5 text-green-400 ml-auto" />
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-12">
                            <div>
                                <div className="text-3xl font-bold">80%</div>
                                <div className="text-blue-200 text-sm">Time Saved</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">99%</div>
                                <div className="text-blue-200 text-sm">Accuracy</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">5 min</div>
                                <div className="text-blue-200 text-sm">Setup Time</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-blue-200 text-sm">
                    © 2025 BoostEntry AI. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link to="/welcome" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">BoostEntry</span>
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                        <p className="text-gray-600">Start your 15-day free trial. No credit card required.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name *</Label>
                            <Input
                                id="company_name"
                                placeholder="Your Company Name"
                                value={form.company_name}
                                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_name">Your Name *</Label>
                            <Input
                                id="contact_name"
                                placeholder="Full Name"
                                value={form.contact_name}
                                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Business Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    placeholder="+91 98765 43210"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    minLength={6}
                                    className="h-12"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                                I agree to the{" "}
                                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                                {" "}and{" "}
                                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating your account..." : "Start Free Trial"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link to="/signin" className="text-blue-600 hover:underline font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
