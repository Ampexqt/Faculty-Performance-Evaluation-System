/**
 * Class Name Utility
 * Merges class names together, filtering out falsy values
 */

import clsx from 'clsx';

export function cn(...inputs) {
    return clsx(inputs);
}
