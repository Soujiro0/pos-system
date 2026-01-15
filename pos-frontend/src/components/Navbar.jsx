import { Share2 } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                        POS System
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                        Product Catalog
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xs">
                        A
                    </div>
                </div>
            </div>
        </nav>
    );
}
