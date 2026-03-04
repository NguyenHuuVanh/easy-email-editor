import React from 'react';
export interface ItemProps {
    /** Elements to display inside item */
    children?: React.ReactNode | any;
    /** Fill the remaining horizontal space in the stack with the item  */
    fill?: boolean;
    /**
     * @default false
     */
    key?: string | number;
}
export declare function Item({ children, fill }: ItemProps): React.JSX.Element;
