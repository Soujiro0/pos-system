import { Share2 } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm border-b border-accent/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-secondary rounded-lg">
                        <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-primary">
                        POS System
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-sm text-accent">
                        Product Catalog
                    </div>
                    <div className="h-8 w-8 rounded-full bg-light/70 flex items-center justify-center text-primary font-medium text-xs">
                        A
                    </div>
                </div>
            </div>
        </nav>
    );
}
