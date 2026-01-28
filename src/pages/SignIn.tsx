import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Zap,
    ArrowRight,
    FileText,
    BarChart3,
    Shield,
    Clock,
    Eye,
    EyeOff
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:8000/api";

const SignIn = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const features = [
        { icon: <FileText className="h-6 w-6" />, title: "Document Automation", desc: "Process BL, BOE, Invoices automatically" },
        { icon: <BarChart3 className="h-6 w-6" />, title: "Analytics Dashboard", desc: "Track processing and team productivity" },
        { icon: <Shield className="h-6 w-6" />, title: "Secure & Reliable", desc: "Enterprise-grade security" },
        { icon: <Clock className="h-6 w-6" />, title: "Save 80% Time", desc: "Reduce manual data entry" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Call the authentication endpoint - verifies email AND password from database
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login failed");
            }

            if (!data.success) {
                toast.error(data.message || "Invalid email or password");
                return;
            }

            // Store session from database response
            localStorage.setItem("4s_user", JSON.stringify(data.user));
            localStorage.setItem("4s_tenant", JSON.stringify(data.tenant));

            toast.success(`Welcome back, ${data.user.name}!`);
            navigate("/");

        } catch (error: any) {
            toast.error(error.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Features */}
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
                            Welcome Back!
                        </h1>
                        <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                            Sign in to continue automating your document processing workflow.
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white/10 rounded-xl p-5">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                                    <p className="text-sm text-blue-200">{feature.desc}</p>
                                </div>
                            ))}
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Your Account</h2>
                        <p className="text-gray-600">Access your dashboard and documents</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password *</Label>
                                <a href="#" className="text-sm text-blue-600 hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    className="h-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            />
                            <label htmlFor="remember" className="text-sm text-gray-600">
                                Remember me for 30 days
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                                Sign Up Free
                            </Link>
                        </p>
                    </div>

                    {/* Trial Reminder */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <p className="text-blue-800 text-sm">
                            <span className="font-semibold">New to BoostEntry?</span> Start your 15-day free trial today!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
