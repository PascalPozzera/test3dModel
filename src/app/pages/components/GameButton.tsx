'use client';

import {ReactNode} from "react";

type Props = {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}


function GameButton({ children, onClick, className = "" }: Props) {
    return (
        <button
            onClick={onClick}
            className={`w-[310px] h-[100px] bg-[url('/assets/button_bg.png')] bg-cover bg-center flex items-center justify-center ${className}`}
        >
      <span className="text-yellow-300 text-3xl font-extrabold drop-shadow-[2px_2px_0px_#2f1b0e] tracking-widest select-none">
        {children}
      </span>
        </button>
    );
}

export default GameButton;
