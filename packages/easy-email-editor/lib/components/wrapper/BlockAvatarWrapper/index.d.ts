import React from 'react';
import { BlockType } from 'easy-email-core';
export type BlockAvatarWrapperProps = {
    children?: React.ReactNode;
    type: BlockType | string;
    payload?: any;
    action?: 'add' | 'move';
    hideIcon?: boolean;
    idx?: string;
};
export declare const BlockAvatarWrapper: React.FC<BlockAvatarWrapperProps>;
