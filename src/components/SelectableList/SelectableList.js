// src/components/SelectableList/SelectableList.js
import React, { useState } from 'react';
import './SelectableList.css';

export default function SelectableList({
                                           items = {},
                                           multiple = false,
                                           onChange = () => {},
                                           className = '',
                                           height, // number (px) o string con unidad (ej. "300px", "40rem")
                                           width,  // number (px) o string con unidad
                                           ...rest
                                       }) {
    const [selected, setSelected] = useState(multiple ? [] : null);
    const keys = Array.isArray(items) ? items : Object.keys(items);

    const containerStyle = {};
    if (height !== undefined) containerStyle.maxHeight = typeof height === 'number' ? `${height}px` : height;
    if (width !== undefined) containerStyle.maxWidth = typeof width === 'number' ? `${width}px` : width;
    // asegurar scroll cuando el contenido excede el max-height
    containerStyle.overflowY = 'auto';

    function toggle(key) {
        if (multiple) {
            const next = (selected || []).includes(key) ? (selected || []).filter(k => k !== key) : [...(selected || []), key];
            setSelected(next);
            onChange(next);
        } else {
            const next = selected === key ? null : key;
            setSelected(next);
            onChange(next);
        }
    }

    return (
        <div className={`selectable-list ${className}`} style={containerStyle} {...rest}>
            {keys.map(k => {
                const label = Array.isArray(items) ? k : items[k];
                const isSelected = multiple ? (selected || []).includes(k) : selected === k;
                return (
                    <div
                        key={k}
                        tabIndex={0}
                        role="button"
                        className={`list-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggle(k)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(k); } }}
                    >
                        {label}
                    </div>
                );
            })}
        </div>
    );
}
