import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems
}) {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        onPageChange(page);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if we're near the start
            if (currentPage <= 3) {
                endPage = 4;
            }

            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                startPage = totalPages - 3;
            }

            // Add ellipsis if needed
            if (startPage > 2) {
                pages.push('...');
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis if needed
            if (endPage < totalPages - 1) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) {
        return null; // Don't show pagination if there's only one page
    }

    return (
        <div className={styles.pagination}>
            <div className={styles.info}>
                Showing {startItem} to {endItem} of {totalItems} entries
            </div>

            <div className={styles.controls}>
                <button
                    className={`${styles.button} ${styles.navButton}`}
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                    Previous
                </button>

                <div className={styles.pages}>
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                className={`${styles.button} ${styles.pageButton} ${currentPage === page ? styles.active : ''
                                    }`}
                                onClick={() => handlePageClick(page)}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button
                    className={`${styles.button} ${styles.navButton}`}
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
