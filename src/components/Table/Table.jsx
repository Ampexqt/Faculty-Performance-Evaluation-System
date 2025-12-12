import React from 'react';
import { cn } from '@/utils/cn';
import styles from './Table.module.css';

export function Table({
    columns = [],
    data = [],
    className,
    onRowClick,
    ...props
}) {
    return (
        <div className={cn(styles.tableWrapper, className)} {...props}>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={cn(
                                    styles.th,
                                    column.align && styles[`align${column.align.charAt(0).toUpperCase() + column.align.slice(1)}`]
                                )}
                                style={{ width: column.width }}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.emptyState}>
                                No data available
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={cn(
                                    styles.tr,
                                    onRowClick && styles.clickable
                                )}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={cn(
                                            styles.td,
                                            column.align && styles[`align${column.align.charAt(0).toUpperCase() + column.align.slice(1)}`]
                                        )}
                                    >
                                        {column.render
                                            ? column.render(row[column.accessor], row, rowIndex)
                                            : row[column.accessor]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
