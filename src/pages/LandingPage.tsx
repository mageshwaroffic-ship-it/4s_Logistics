import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    FileText,
    Zap,
    Shield,
    Clock,
    CheckCircle2,
    ArrowRight,
    ChevronRight,
    FileSpreadsheet,
    Upload,
    Database,
    BarChart3,
    Users,
    Bell,
    Star,
    Play,
    Menu,
    X
} from "lucide-react";

const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const features = [
        {
            icon: <FileText className="h-8 w-8" />,
            title: "Bill of Lading (BL)",
            description: "Auto-extract shipper, consignee, container details, and cargo information from BL documents instantly."
        },
        {
            icon: <FileSpreadsheet className="h-8 w-8" />,
            title: "Bill of Entry (BOE)",
            description: "Automated BOE data extraction with HS code mapping, duty calculation, and customs compliance."
        },
        {
            icon: <Upload className="h-8 w-8" />,
            title: "Invoice Processing",
            description: "Extract line items, quantities, values, and tax details from commercial invoices automatically."
        },
        {
            icon: <Database className="h-8 w-8" />,
            title: "Packing List",
            description: "Parse carton details, weights, dimensions, and item descriptions with 99% accuracy."
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "Workflow Automation",
            description: "Trigger automated workflows - from document upload to ERP/CRM entry in seconds."
        },
        {
            icon: <BarChart3 className="h-8 w-8" />,
            title: "Analytics & Reports",
            description: "Track processing times, error rates, and team productivity with detailed dashboards."
        }
    ];

    const testimonials = [
        {
            quote: "BoostEntry reduced our data entry time by 80%. What took 1 hour now takes 10 minutes.",
            name: "Satyan Thukral",
            role: "CEO",
            company: "KSS Roadways"
        },
        {
            quote: "We process 1000+ invoices daily. BoostEntry eliminated manual errors completely.",
            name: "Vishwadh Kandula",
            role: "Operations Head",
            company: "Global Freight Solutions"
        },
        {
            quote: "The BOE automation alone saved us 2 full-time employees worth of work.",
            name: "Navedh V.V",
            role: "Co-Founder",
            company: "Express Customs Brokers"
        }
    ];

    const workflowSteps = [
        { step: 1, title: "Upload Document", desc: "Drop your BL, BOE, Invoice, or Packing List" },
        { step: 2, title: "AI Extraction", desc: "Our AI extracts all fields automatically" },
        { step: 3, title: "Verify & Edit", desc: "Quick review with smart suggestions" },
        { step: 4, title: "Export to ERP", desc: "One-click push to your system" }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/welcome" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">BoostEntry</span>
                            <Badge variant="secondary" className="hidden sm:inline-flex text-xs">AI</Badge>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition">Features</a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition">How it Works</a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition">Pricing</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition">Success Stories</a>
                        </nav>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/signin">
                                <Button variant="ghost" className="font-medium">Sign In</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6">
                                    Sign Up Now
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <nav className="flex flex-col gap-4">
                                <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
                                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How it Works</a>
                                <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
                                <div className="flex gap-4 pt-4 border-t">
                                    <Link to="/signin" className="flex-1">
                                        <Button variant="outline" className="w-full">Sign In</Button>
                                    </Link>
                                    <Link to="/signup" className="flex-1">
                                        <Button className="w-full bg-orange-500 hover:bg-orange-600">Sign Up</Button>
                                    </Link>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-1.5 text-sm">
                            ✨ AI-Powered Document Automation
                        </Badge>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            Automate Your
                            <span className="block text-yellow-300">Document Data Entry</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                            BoostEntry extracts data from BL, BOE, Invoices, and Packing Lists automatically.
                            Reduce manual entry by 80% and eliminate errors.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link to="/signup">
                                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg w-full sm:w-auto">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <a href="#how-it-works">
                                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-lg w-full sm:w-auto">
                                    <Play className="mr-2 h-5 w-5" />
                                    See How It Works
                                </Button>
                            </a>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center gap-6 text-blue-100">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                <span>15-Day Free Trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                <span>No Credit Card Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                <span>Setup in 5 Minutes</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Preview */}
                    <div className="mt-16 relative">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-5xl mx-auto border border-white/20 shadow-2xl">
                            <div className="bg-gray-900 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-4 text-gray-400 text-sm">BoostEntry Dashboard</span>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900">
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        {["BL Documents", "BOE Filed", "Invoices Processed", "Accuracy Rate"].map((stat, i) => (
                                            <div key={i} className="bg-gray-700/50 rounded-lg p-4 text-center">
                                                <div className="text-2xl font-bold text-white">{["1,247", "892", "3,456", "99.2%"][i]}</div>
                                                <div className="text-xs text-gray-400">{stat}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {["Bill of Lading", "Commercial Invoice", "Packing List"].map((doc, i) => (
                                            <div key={i} className="bg-gray-700/30 rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium text-sm">{doc}</div>
                                                        <div className="text-gray-400 text-xs">Processing...</div>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${70 + i * 10}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-gray-50 border-y">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600">80%</div>
                            <div className="text-gray-600 mt-1">Time Saved</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600">50+</div>
                            <div className="text-gray-600 mt-1">Companies Trust Us</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600">1M+</div>
                            <div className="text-gray-600 mt-1">Documents Processed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600">99%</div>
                            <div className="text-gray-600 mt-1">Accuracy Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <Badge className="bg-blue-100 text-blue-700 mb-4">Features</Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Document Types We Handle
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            From Bill of Lading to Packing Lists - automate every document in your customs workflow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300">
                                <CardContent className="p-6">
                                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <Badge className="bg-green-100 text-green-700 mb-4">How It Works</Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            From Document to Data in Seconds
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Four simple steps to automate your document processing workflow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {workflowSteps.map((item, index) => (
                            <div key={index} className="relative">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                        {item.step}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-blue-200">
                                        <ChevronRight className="absolute right-0 -top-2 text-blue-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/signup">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8">
                                Try It Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <Badge className="bg-purple-100 text-purple-700 mb-4">Success Stories</Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Trusted by Leading Companies
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xl md:text-2xl text-gray-700 italic mb-8 leading-relaxed">
                                "{testimonials[currentTestimonial].quote}"
                            </p>
                            <div>
                                <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</p>
                                <p className="text-gray-600">{testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}</p>
                            </div>
                            <div className="flex justify-center gap-2 mt-6">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentTestimonial ? 'bg-blue-600 w-6' : 'bg-gray-300'}`}
                                        onClick={() => setCurrentTestimonial(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <Badge className="bg-orange-100 text-orange-700 mb-4">Pricing</Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-gray-600">Start free. Scale as you grow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Trial */}
                        <Card className="border-gray-200">
                            <CardContent className="p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Trial</h3>
                                <p className="text-gray-600 mb-4">Perfect to get started</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">Free</span>
                                    <span className="text-gray-600"> / 15 days</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {["100 Documents/month", "2 Users", "BL & Invoice Support", "Email Support"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/signup">
                                    <Button variant="outline" className="w-full">Start Free Trial</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Pro Plan */}
                        <Card className="border-blue-500 border-2 relative shadow-xl">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                            </div>
                            <CardContent className="p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                                <p className="text-gray-600 mb-4">For growing businesses</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">₹4,999</span>
                                    <span className="text-gray-600"> / month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {["Unlimited Documents", "10 Users", "All Document Types", "WhatsApp Alerts", "Priority Support", "API Access"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/signup">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Enterprise */}
                        <Card className="border-gray-200">
                            <CardContent className="p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                                <p className="text-gray-600 mb-4">For large organizations</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {["Everything in Pro", "Unlimited Users", "Custom Integrations", "Dedicated Support", "On-premise Option", "SLA Guarantee"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="outline" className="w-full">Contact Sales</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to Automate Your Document Processing?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join 50+ companies saving hours every day with BoostEntry.
                    </p>
                    <Link to="/signup">
                        <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg">
                            Start Your Free Trial
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">BoostEntry</span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                AI-powered document automation for customs brokers and logistics companies.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                                <li><a href="#testimonials" className="hover:text-white transition">Success Stories</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm">
                                <li>sales@boostentryai.com</li>
                                <li>+91 81227 84236</li>
                                <li>Chennai, India</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        © 2025 BoostEntry AI. All rights reserved. | Powered by Work Booster AI
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
