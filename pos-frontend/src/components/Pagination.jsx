import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    currentPage,
    lastPage,
    onPageChange,
    total,
    perPage,
    onPerPageChange
}) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (lastPage <= maxVisiblePages) {
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(lastPage);
            } else if (currentPage >= lastPage - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = lastPage - 3; i <= lastPage; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(lastPage);
            }
        }
        return pages;
    };

    const startEntry = (currentPage - 1) * perPage + 1;
    const endEntry = Math.min(currentPage * perPage, total);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t border-accent/10">
            {/* Entries Per Page Selector */}
            <div className="flex items-center text-sm text-accent">
                <span>Show</span>
                <select
                    value={perPage}
                    onChange={(e) => onPerPageChange(Number(e.target.value))}
                    className="mx-2 px-2 py-1 border border-accent/20 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-white"
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span>entries</span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-accent mr-4">
                    Showing {Math.max(0, startEntry)} to {Math.max(0, endEntry)} of {total} results
                </span>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-accent/20 hover:bg-light/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                            disabled={page === '...'}
                            className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                ? 'bg-secondary text-white shadow-sm shadow-secondary/20'
                                : page === '...'
                                    ? 'text-gray-400 cursor-default'
                                    : 'text-primary hover:bg-light/30 border border-transparent hover:border-accent/20'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className="p-2 rounded-lg border border-accent/20 hover:bg-light/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
