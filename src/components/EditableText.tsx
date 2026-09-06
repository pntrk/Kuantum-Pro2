import React, { useState, useEffect, useRef } from 'react';
import { Edit2 } from 'lucide-react';

export default function EditableText({ value, onSave, className, textClassName }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (tempValue.trim() && tempValue !== value) {
            onSave(tempValue.trim());
        } else {
            setTempValue(value);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={`bg-white border-2 border-indigo-500 rounded px-2 py-0.5 outline-none text-slate-800 shadow-sm ${className || ''}`} onClick={e => e.stopPropagation()}
            />
        );
    }

    return (
        <span 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
            className={`cursor-pointer group flex items-center gap-1.5 transition-colors ${textClassName || ''}`}
            title="Tıkla ve düzenle"
        >
            {value}
            <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
        </span>
    );
}
