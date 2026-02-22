import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, ChevronRight, Search, Plus, Settings, Type,
    Heading1, Heading2, Heading3, List, Code as CodeIcon, FunctionSquare,
    GripVertical, Bold, Italic, Palette, Type as FontIcon, FilePlus, ChevronDown, Copy, Trash, FileText, Download, Save, Lock, Table, Link2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';
import { initialPages } from './data/postsData';

/* Code Editor & Syntax Highlighting */
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import 'prismjs/themes/prism-okaidia.css';

/* Math / KaTeX rendering */
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const COMMAND_MENU_ITEMS = [
    { id: 'p', label: 'Text', description: 'Plain text.', icon: Type },
    { id: 'h1', label: 'Heading 1', description: 'Big section heading.', icon: Heading1 },
    { id: 'h2', label: 'Heading 2', description: 'Medium section heading.', icon: Heading2 },
    { id: 'h3', label: 'Heading 3', description: 'Small section heading.', icon: Heading3 },
    { id: 'bullet', label: 'Bulleted list', description: 'Simple bulleted list.', icon: List },
    { id: 'code', label: 'Code', description: 'Syntax highlighted code.', icon: CodeIcon },
    { id: 'math', label: 'Math Equation', description: 'KaTeX block equation.', icon: FunctionSquare },
    { id: 'table', label: 'Table', description: 'Simple grid.', icon: Table },
    { id: 'link', label: 'Link to Page', description: 'Link to an existing page.', icon: Link2 },
    { id: 'page', label: 'Page', description: 'Embed a sub-page.', icon: FilePlus },
];

const COLORS = ['#000000', '#E03E3E', '#D9730D', '#0F7B6C', '#0B6E99', '#6940A5', '#e9a3b9'];
const FONTS = ['Inter, sans-serif', 'Georgia, serif', '"Fira Code", monospace', '"Comic Sans MS", cursive'];

const EditableBlock = React.memo(({ html, tagName, className, onChange, onKeyDown, onImagePaste, onFocus, placeholder, autoFocus, readOnly }) => {
    const contentEditable = useRef(null);

    useEffect(() => {
        // Initial content setup to avoid re-renders resetting caret position
        if (contentEditable.current && contentEditable.current.innerHTML === '') {
            contentEditable.current.innerHTML = html;
        }
    }, []);

    useEffect(() => {
        if (contentEditable.current && autoFocus && !readOnly) {
            // focus and place caret at end
            contentEditable.current.focus();
            try {
                const range = document.createRange();
                const sel = window.getSelection();
                if (contentEditable.current.childNodes.length > 0) {
                    range.setStart(contentEditable.current.childNodes[0], contentEditable.current.childNodes[0].length);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            } catch (e) {
                // ignore empty node ranges
            }
        }
    }, [autoFocus, readOnly]);

    // Sync external changes (commands, formatting updates from parent)
    useEffect(() => {
        if (contentEditable.current && html !== contentEditable.current.innerHTML) {
            // Always sync when empty (to clear dash/other markers) or when element is not focused
            if (html === '' || document.activeElement !== contentEditable.current) {
                contentEditable.current.innerHTML = html;
            }
        }
    }, [html, tagName]);

    const emitChange = () => {
        if (contentEditable.current && !readOnly) {
            onChange(contentEditable.current.innerHTML);
        }
    };

    return React.createElement(tagName || 'div', {
        ref: contentEditable,
        className: cn('outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-300', className),
        contentEditable: !readOnly,
        suppressContentEditableWarning: true,
        onInput: emitChange,
        onBlur: emitChange,
        onKeyDown: (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onKeyDown(e);
            } else {
                onKeyDown(e);
            }
        },
        onPaste: (e) => {
            if (readOnly) return;
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (onImagePaste) onImagePaste(event.target.result);
                    };
                    reader.readAsDataURL(blob);
                    return;
                }
            }
        },
        onFocus,
        placeholder,
        style: { minHeight: '1.5em', userSelect: 'text' }
    });
});

function Block({ block, index, updateBlock, addBlock, insertBlock, removeBlock, setFocus, createNewPage, activePageId, pages, setActivePageId, moveBlock, duplicateBlock, dragOverIndex, setDragOverIndex, isReadOnly, isSelectingText, enableSelectionMode }) {
    const [showCommands, setShowCommands] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [blockMenuOpen, setBlockMenuOpen] = useState(false);
    const menuListRef = useRef(null);

    const [showPageSelect, setShowPageSelect] = useState(false);
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const pageListRef = useRef(null);
    const preSlashContentRef = useRef('');

    const [codeLanguage, setCodeLanguage] = useState('javascript');

    const filteredCommands = COMMAND_MENU_ITEMS.filter(item =>
        item.label.toLowerCase().includes(commandQuery.toLowerCase())
    );

    const filteredPages = pages.filter(p => p.id !== activePageId && (p.title || 'Untitled').replace(/<[^>]+>/g, '').toLowerCase().includes(commandQuery.toLowerCase()));

    useEffect(() => {
        if (showCommands && menuListRef.current) {
            const selectedEl = menuListRef.current.children[selectedIndex + 1];
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
        if (showPageSelect && pageListRef.current) {
            const selectedEl = pageListRef.current.children[selectedPageIndex + 1];
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, showCommands, selectedPageIndex, showPageSelect]);

    const executePageLink = (targetPageId) => {
        updateBlock(block.id, { type: 'page', pageId: targetPageId, content: '' });
        setShowPageSelect(false);
    };

    const handleKeyDown = (e) => {
        if (isReadOnly) return;

        // Markdown shortcut: "- " converts to bullet
        if (e.key === ' ' && block.type === 'p') {
            const raw = block.content.replace(/<[^>]+>/g, '').replace(/\u00a0/g, ' ').trim();
            if (raw === '-') {
                e.preventDefault();
                updateBlock(block.id, { type: 'bullet', content: '' });
                return;
            }
        }

        if (e.key === '/' && !['code', 'math', 'image'].includes(block.type)) {
            preSlashContentRef.current = block.content; // Save content before slash for clean restoration
            setShowCommands(true);
            setShowPageSelect(false);
            setCommandQuery('');
            setSelectedIndex(0);
        } else if (showCommands || showPageSelect) {
            if (e.key === 'Escape') {
                setShowCommands(false);
                setShowPageSelect(false);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (showCommands) setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
                if (showPageSelect && filteredPages.length) setSelectedPageIndex((prev) => (prev + 1) % filteredPages.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (showCommands) setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                if (showPageSelect && filteredPages.length) setSelectedPageIndex((prev) => (prev - 1 + filteredPages.length) % filteredPages.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (showCommands && filteredCommands[selectedIndex]) {
                    executeCommand(filteredCommands[selectedIndex].id);
                } else if (showPageSelect && filteredPages[selectedPageIndex]) {
                    executePageLink(filteredPages[selectedPageIndex].id);
                }
            } else if (e.key === 'Backspace' && commandQuery.length === 0) {
                setShowCommands(false);
                setShowPageSelect(false);
            }
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            addBlock(index);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            if (block.type === 'code' || block.type === 'math') return;
            e.preventDefault();
            addBlock(index);
        } else if (e.key === 'Backspace' && (block.content === '' || block.content === '<br>')) {
            e.preventDefault();
            if (block.type !== 'p') {
                updateBlock(block.id, { type: 'p' });
            } else {
                removeBlock(index);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const totalBlocks = pages.find(p => p.id === activePageId)?.blocks.length || 0;

            // Textarea handling (math block)
            if (e.target.tagName === 'TEXTAREA') {
                const val = e.target.value;
                const cursorPos = e.target.selectionStart;
                if (e.key === 'ArrowUp') {
                    // If cursor is on the first line, navigate up
                    const textBeforeCursor = val.substring(0, cursorPos);
                    if (!textBeforeCursor.includes('\n') && index > 0) {
                        e.preventDefault();
                        setFocus(index - 1);
                    }
                } else if (e.key === 'ArrowDown') {
                    // If cursor is on the last line, navigate down
                    const textAfterCursor = val.substring(cursorPos);
                    if (!textAfterCursor.includes('\n') && index < totalBlocks - 1) {
                        e.preventDefault();
                        setFocus(index + 1);
                    }
                }
                return;
            }

            // ContentEditable handling (text blocks)
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const editableRect = e.target.getBoundingClientRect();

            if (e.key === 'ArrowUp') {
                if (index > 0 && (rect.top - editableRect.top < 20)) {
                    e.preventDefault();
                    setFocus(index - 1);
                }
            } else if (e.key === 'ArrowDown') {
                if (index < totalBlocks - 1) {
                    if (editableRect.bottom - rect.bottom < 20) {
                        e.preventDefault();
                        setFocus(index + 1);
                    }
                }
            }
        }
    };

    const handleChange = (htmlVal) => {
        const rawText = htmlVal.replace(/<[^>]+>/g, '').replace(/\u00a0/g, ' ');

        if (showCommands) {
            const slashIndex = rawText.lastIndexOf('/');
            if (slashIndex !== -1) {
                setCommandQuery(rawText.substring(slashIndex + 1));
                setSelectedIndex(0);
            }
        }
        updateBlock(block.id, { content: htmlVal });
    };

    const executeCommand = (typeId) => {
        if (typeId === 'page') {
            createNewPage(activePageId, block.id);
            setShowCommands(false);
            return;
        }

        if (typeId === 'link') {
            setShowCommands(false);
            setShowPageSelect(true);
            setCommandQuery('');
            setSelectedPageIndex(0);
            return;
        }

        // Use the saved pre-slash content to avoid stale closure issues and HTML tag mistaken slashes
        let newContent = preSlashContentRef.current || '';

        if (typeId === 'table') {
            newContent = JSON.stringify([['', ''], ['', '']]); // 2x2 default table
        }

        updateBlock(block.id, { type: typeId, content: newContent });
        setShowCommands(false);
    };

    const getBlockStyle = () => {
        switch (block.type) {
            case 'h1': return 'text-4xl font-bold mt-8 mb-4 tracking-tight text-ink-black';
            case 'h2': return 'text-2xl font-bold mt-6 mb-3 tracking-tight text-ink-black';
            case 'h3': return 'text-xl font-bold mt-4 mb-2 tracking-tight text-ink-black';
            case 'bullet': return 'list-none text-ink-black';
            default: return 'text-base my-1 text-ink-black font-medium leading-relaxed';
        }
    };

    // Drag and Drop handlers
    const onDragStart = (e) => {
        e.dataTransfer.setData('text/plain', index);
        setTimeout(() => setBlockMenuOpen(false), 0);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const onDragLeave = () => {
        setDragOverIndex(null);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOverIndex(null);
        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(draggedIndex) && draggedIndex !== index) {
            moveBlock(draggedIndex, index);
        }
    };

    // Handle arrow key navigation at the block wrapper level (for non-editable blocks like image, page, rendered math)
    const handleBlockKeyDown = (e) => {
        if (isReadOnly) return;
        const nonEditableTypes = ['image', 'page'];
        const isRenderedMath = block.type === 'math' && !block.focused && block.content !== '';
        const isNonEditable = nonEditableTypes.includes(block.type) || isRenderedMath;

        if (!isNonEditable) return; // Let text blocks handle their own arrow keys

        const totalBlocks = pages.find(p => p.id === activePageId)?.blocks.length || 0;

        if (e.key === 'ArrowUp' && index > 0) {
            e.preventDefault();
            setFocus(index - 1);
        } else if (e.key === 'ArrowDown' && index < totalBlocks - 1) {
            e.preventDefault();
            setFocus(index + 1);
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            addBlock(index);
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            removeBlock(index);
        }
    };

    return (
        <div
            tabIndex={-1}
            data-block-index={index}
            style={{ outline: 'none' }}
            onKeyDown={handleBlockKeyDown}
            className={cn(
                "group relative flex items-start pr-4 transition-colors mb-1",
                !isReadOnly ? "-ml-12 pl-12" : "ml-0 pl-4",
                dragOverIndex === index && !isReadOnly ? "border-t-2 border-blue-500 pt-1" : ""
            )}
            onDragOver={!isReadOnly ? onDragOver : undefined}
            onDragLeave={!isReadOnly ? onDragLeave : undefined}
            onDrop={!isReadOnly ? onDrop : undefined}
        >
            {!isReadOnly && (
                <div
                    className="absolute left-[18px] top-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-gray-100 p-1 rounded text-gray-400 flex items-center justify-center select-none z-10"
                    contentEditable={false}
                    draggable
                    onDragStart={onDragStart}
                    onClick={() => setBlockMenuOpen(!blockMenuOpen)}
                >
                    <GripVertical size={16} />
                </div>
            )}

            {blockMenuOpen && (
                <div className="absolute left-[18px] top-8 bg-white border border-gray-200 shadow-xl rounded-xl py-1.5 z-50 w-56 text-sm select-auto animate-in fade-in slide-in-from-top-1" contentEditable={false}>
                    <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Turn into</div>
                    {COMMAND_MENU_ITEMS.filter(c => !['page', 'link', 'table'].includes(c.id)).map(cmd => {
                        const Icon = cmd.icon;
                        const isActive = block.type === cmd.id;
                        return (
                            <button
                                key={cmd.id}
                                onClick={() => {
                                    if (cmd.id === 'code' || cmd.id === 'math') {
                                        updateBlock(block.id, { type: cmd.id, content: block.content.replace(/<[^>]+>/g, '') });
                                    } else {
                                        updateBlock(block.id, { type: cmd.id });
                                    }
                                    setBlockMenuOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-3 py-1.5 flex items-center gap-2.5 transition-colors",
                                    isActive ? "bg-sky-50 text-deep-blue font-bold" : "hover:bg-gray-50 text-ink-black"
                                )}
                            >
                                <Icon size={15} className={isActive ? "text-deep-blue" : "text-gray-400"} />
                                <span className="flex-1">{cmd.label}</span>
                                {isActive && <span className="text-deep-blue text-xs">✓</span>}
                            </button>
                        );
                    })}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={() => { duplicateBlock(index); setBlockMenuOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-ink-black"><Copy size={15} className="text-gray-400" /> Duplicate</button>
                    <button onClick={() => { removeBlock(index); setBlockMenuOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2.5 text-red-500"><Trash size={15} /> Delete</button>
                </div>
            )}

            <div className="relative w-full flex items-start">
                {block.type === 'bullet' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-ink-black shrink-0 mt-[0.65em] mr-4 ml-2" />
                )}

                {/* Child Page Link */}
                {block.type === 'page' ? (
                    <div
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 cursor-pointer text-ink-black font-bold border border-transparent hover:border-gray-200 transition-colors my-1 w-fit pr-4"
                        onClick={() => setActivePageId(block.pageId)}
                    >
                        <span className="text-gray-400"><FileText size={18} /></span>
                        <span className="underline decoration-gray-300 underline-offset-4">{pages.find(p => p.id === block.pageId)?.title?.replace(/<[^>]+>/g, '') || 'Untitled'}</span>
                    </div>
                )
                    /* Table Block */
                    : block.type === 'table' ? (() => {
                        let tableData;
                        try {
                            tableData = JSON.parse(block.content);
                            if (!Array.isArray(tableData) || tableData.length === 0) throw new Error();
                        } catch (e) {
                            tableData = [['', ''], ['', '']];
                        }

                        const updateCell = (rIndex, cIndex, val) => {
                            const newTable = [...tableData];
                            newTable[rIndex] = [...newTable[rIndex]];
                            newTable[rIndex][cIndex] = val;
                            updateBlock(block.id, { content: JSON.stringify(newTable) });
                        };

                        const addRow = () => {
                            const newTable = [...tableData, new Array(tableData[0].length).fill('')];
                            updateBlock(block.id, { content: JSON.stringify(newTable) });
                        };

                        const addCol = () => {
                            const newTable = tableData.map(row => [...row, '']);
                            updateBlock(block.id, { content: JSON.stringify(newTable) });
                        };

                        return (
                            <div className="my-4 w-full relative group/table overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-200 text-sm bg-white">
                                    <tbody>
                                        {tableData.map((row, rIndex) => (
                                            <tr key={rIndex} className={rIndex === 0 ? "bg-gray-50 font-medium" : ""}>
                                                {row.map((cell, cIndex) => (
                                                    <td key={cIndex} className="border border-gray-200 relative min-w-[100px] p-0 align-top">
                                                        <EditableBlock
                                                            html={cell}
                                                            onChange={(val) => updateCell(rIndex, cIndex, val)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    // prevent default but do not jump out of table natively
                                                                    // We just allow shift+enter for new line, regular enter jumps out? 
                                                                    // Let's just prevent default if they try to jump out via enter
                                                                }
                                                            }}
                                                            onFocus={() => { if (!isReadOnly) setFocus(index); }}
                                                            className="outline-none min-h-[1.5em] p-2"
                                                            readOnly={isReadOnly}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!isReadOnly && (
                                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/table:opacity-100 transition-opacity">
                                        <button onClick={addCol} className="p-1 hover:bg-gray-100 text-gray-500 rounded border border-gray-200 bg-white shadow-sm" title="Add Column"><Plus size={14} /></button>
                                    </div>
                                )}
                                {!isReadOnly && (
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/table:opacity-100 transition-opacity">
                                        <button onClick={addRow} className="p-1 hover:bg-gray-100 text-gray-500 rounded border border-gray-200 bg-white shadow-sm" title="Add Row"><Plus size={14} /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })()
                        /* Image Block */
                        : block.type === 'image' ? (
                            <div className={cn("my-4 w-full relative group/image flex flex-col", block.align === 'left' ? "items-start" : block.align === 'right' ? "items-end" : "items-center")}>
                                <img src={block.content} alt="Pasted content" className="max-w-full rounded-lg shadow-sm border border-gray-200" />
                                {!isReadOnly && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                        <div className="flex bg-white/80 hover:bg-white rounded shadow text-gray-500 overflow-hidden">
                                            <button onClick={() => updateBlock(block.id, { align: 'left' })} className={cn("px-2 py-1.5 hover:bg-gray-100", block.align === 'left' ? "bg-gray-200 text-ink-black" : "")} title="Align Left">L</button>
                                            <button onClick={() => updateBlock(block.id, { align: 'center' })} className={cn("px-2 py-1.5 hover:bg-gray-100 border-x border-gray-200", (!block.align || block.align === 'center') ? "bg-gray-200 text-ink-black" : "")} title="Align Center">C</button>
                                            <button onClick={() => updateBlock(block.id, { align: 'right' })} className={cn("px-2 py-1.5 hover:bg-gray-100", block.align === 'right' ? "bg-gray-200 text-ink-black" : "")} title="Align Right">R</button>
                                        </div>
                                        <button onClick={() => updateBlock(block.id, { type: 'p', content: '' })} className="p-1.5 bg-white/80 hover:bg-white text-gray-500 rounded shadow">
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                            /* Code Block rendering */
                            : block.type === 'code' ? (
                                <div className="my-4 w-full relative bg-[#272822] rounded-xl shadow-sm border border-gray-800 overflow-hidden group/code">
                                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                                        <select
                                            className="bg-black/40 text-xs text-white border border-white/10 rounded px-2 py-1 outline-none font-mono"
                                            value={codeLanguage}
                                            onChange={(e) => setCodeLanguage(e.target.value)}
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="css">CSS</option>
                                            <option value="json">JSON</option>
                                        </select>
                                    </div>
                                    <Editor
                                        value={block.content.replace(/<[^>]+>/g, '')}
                                        onValueChange={code => updateBlock(block.id, { content: code })}
                                        onFocus={() => setFocus(index)}
                                        highlight={code => Prism.highlight(code, Prism.languages[codeLanguage] || Prism.languages.javascript, codeLanguage)}
                                        className="font-mono text-sm w-full min-h-[100px] text-white p-6 outline-none"
                                        style={{ fontFamily: '"Fira Code", "JetBrains Mono", monospace' }}
                                        textareaClassName="outline-none"
                                    />
                                </div>
                            )
                                /* Math Equation Rendering */
                                : block.type === 'math' ? (
                                    <div className={cn("my-4 w-full relative group/math", block.align === 'left' ? "text-left" : block.align === 'right' ? "text-right" : "text-center")}>
                                        {block.focused || block.content === '' ? (
                                            <textarea
                                                value={block.content.replace(/<[^>]+>/g, '')}
                                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                                onKeyDown={handleKeyDown}
                                                onFocus={(e) => {
                                                    setFocus(index);
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                                onInput={(e) => {
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                                placeholder="Enter KaTeX equation (e.g., E = mc^2)"
                                                className={cn("w-full resize-none overflow-hidden outline-none bg-gray-50 text-gray-600 font-mono text-sm p-4 rounded-lg border border-gray-200 min-h-[56px]")}
                                                rows={1}
                                            />
                                        ) : (
                                            <div
                                                className="py-4 px-8 cursor-text text-lg bg-gray-50/50 rounded-lg border border-transparent hover:border-gray-200 transition-colors w-full"
                                                style={{ textAlign: block.align === 'left' ? 'left' : block.align === 'right' ? 'right' : 'center' }}
                                                onClick={() => setFocus(index)}
                                            >
                                                <BlockMath math={
                                                    (() => {
                                                        let raw = block.content.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').trim();
                                                        // Convert user spaces to KaTeX-visible spaces (~), but NOT after backslash commands
                                                        raw = raw.replace(/(?<!\\[a-zA-Z]+) /g, '~');
                                                        if (raw.includes('\n') && !raw.includes('\\begin{')) {
                                                            const lines = raw.replace(/\n/g, '\\\\');
                                                            if (block.align === 'left') {
                                                                return `\\begin{array}{l}\n${lines}\n\\end{array}`;
                                                            } else if (block.align === 'right') {
                                                                return `\\begin{array}{r}\n${lines}\n\\end{array}`;
                                                            }
                                                            return `\\begin{gathered}\n${lines}\n\\end{gathered}`;
                                                        }
                                                        return raw || " ";
                                                    })()
                                                } errorColor={'#cc0000'} />
                                            </div>
                                        )}
                                        {!isReadOnly && (
                                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/math:opacity-100 transition-opacity z-10">
                                                <div className="flex bg-white/90 rounded shadow text-gray-500 overflow-hidden text-xs font-bold">
                                                    <button onClick={() => updateBlock(block.id, { align: 'left' })} className={cn("px-2 py-1 hover:bg-gray-100", block.align === 'left' ? "bg-gray-200 text-ink-black" : "")} title="Align Left">L</button>
                                                    <button onClick={() => updateBlock(block.id, { align: 'center' })} className={cn("px-2 py-1 hover:bg-gray-100 border-x border-gray-200", (!block.align || block.align === 'center') ? "bg-gray-200 text-ink-black" : "")} title="Align Center">C</button>
                                                    <button onClick={() => updateBlock(block.id, { align: 'right' })} className={cn("px-2 py-1 hover:bg-gray-100", block.align === 'right' ? "bg-gray-200 text-ink-black" : "")} title="Align Right">R</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                                    /* Standard Editable Text Types */
                                    : (
                                        <div className="w-full flex-1 relative">
                                            <EditableBlock
                                                html={block.content}
                                                onChange={handleChange}
                                                onKeyDown={handleKeyDown}
                                                onImagePaste={(base64) => {
                                                    if (block.content.trim() === '' || block.content === '<br>') {
                                                        updateBlock(block.id, { type: 'image', content: base64 });
                                                    } else {
                                                        insertBlock(index, { type: 'image', content: base64 });
                                                    }
                                                }}
                                                onFocus={() => { if (!isReadOnly) setFocus(index); }}
                                                autoFocus={block.focused && !isReadOnly}
                                                placeholder={block.type === 'p' && !isReadOnly ? (block.content === '' && block.focused ? "Type '/' for commands" : "") : (block.type === 'h1' ? 'Heading 1' : '')}
                                                className={getBlockStyle()}
                                                tagName={block.type === 'h1' ? 'h1' : block.type === 'h2' ? 'h2' : block.type === 'h3' ? 'h3' : 'div'}
                                                readOnly={isReadOnly}
                                            />
                                        </div>
                                    )}

                {/* Command Menu Popup - scrollable to 6 items */}
                {showCommands && (
                    <div
                        ref={menuListRef}
                        className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 fade-up max-h-64 overflow-y-auto"
                        contentEditable={false}
                    >
                        <div className="px-3 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10">Basic blocks</div>
                        {filteredCommands.length > 0 ? (
                            filteredCommands.map((cmd, idx) => {
                                const Icon = cmd.icon;
                                const isSelected = idx === selectedIndex;
                                return (
                                    <button
                                        key={cmd.id}
                                        onClick={(e) => { e.preventDefault(); executeCommand(cmd.id); }}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 transition-colors text-left",
                                            isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 shrink-0 rounded-lg border border-gray-200 bg-white flex items-center justify-center shadow-sm", isSelected ? "text-deep-blue" : "text-gray-600")}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-bold text-ink-black">{cmd.label}</div>
                                            <div className="text-xs text-slate-muted truncate">{cmd.description}</div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No matching commands.</div>
                        )}
                    </div>
                )}

                {/* Page Link Popup */}
                {showPageSelect && (
                    <div
                        ref={pageListRef}
                        className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 fade-up max-h-64 overflow-y-auto"
                        contentEditable={false}
                    >
                        <div className="px-3 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10">Link to Page</div>
                        {filteredPages && filteredPages.length > 0 ? (
                            filteredPages.map((p, idx) => {
                                const isSelected = idx === selectedPageIndex;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={(e) => { e.preventDefault(); executePageLink(p.id); }}
                                        onMouseEnter={() => setSelectedPageIndex(idx)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 transition-colors text-left",
                                            isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 shrink-0 rounded-lg border border-gray-200 bg-white flex items-center justify-center shadow-sm", isSelected ? "text-deep-blue" : "text-gray-600")}>
                                            <span className="text-xl">{p.icon || '📄'}</span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-bold text-ink-black truncate">{p.title?.replace(/<[^>]+>/g, '') || 'Untitled'}</div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No pages found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function FormattingToolbar() {
    const [position, setPosition] = useState({ x: 0, y: 0, show: false });
    const [activeMenu, setActiveMenu] = useState(null); // 'color', 'highlight', 'font', or null

    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0 && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                const isEditor = selection.anchorNode.parentElement?.closest('[contenteditable="true"]');
                if (isEditor) {
                    setPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 40,
                        show: true
                    });
                }
            } else {
                setPosition(p => ({ ...p, show: false }));
                setActiveMenu(null); // close menus when selection lost
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, []);

    // Close menu when clicking outside the toolbar area entirely
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('#formatting-toolbar')) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const format = (command, value = null) => {
        document.execCommand(command, false, value);
        setActiveMenu(null); // Explicitly close any open sub-menu after selection!
    };

    if (!position.show) return null;

    return (
        <div
            id="formatting-toolbar"
            className="fixed z-50 bg-gray-900 shadow-xl rounded-lg flex items-center px-2 py-1 gap-1 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2"
            style={{ left: position.x, top: position.y }}
            onMouseDown={(e) => {
                // Prevent selection loss when clicking toolbars
                if (!e.target.closest('button')) e.preventDefault();
            }}
        >
            <button onMouseDown={(e) => { e.preventDefault(); format('bold'); }} className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors"><Bold size={16} /></button>
            <button onMouseDown={(e) => { e.preventDefault(); format('italic'); }} className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors"><Italic size={16} /></button>

            <div className="h-4 w-px bg-gray-700 mx-1"></div>

            {/* ForeColor Menu */}
            <div className="relative">
                <button
                    onMouseDown={(e) => { e.preventDefault(); setActiveMenu(activeMenu === 'color' ? null : 'color'); }}
                    className={cn("p-1.5 text-white rounded transition-colors flex items-center gap-1", activeMenu === 'color' ? "bg-gray-700" : "hover:bg-gray-700")}
                >
                    <Palette size={16} /> <ChevronDown size={12} />
                </button>
                {activeMenu === 'color' && (
                    <div className="absolute top-full mt-1 left-0 bg-white shadow-xl border border-gray-100 rounded p-2 grid grid-cols-4 gap-1 w-32">
                        {COLORS.map(c => (
                            <button key={c} onMouseDown={(e) => { e.preventDefault(); format('foreColor', c); }} className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                )}
            </div>

            {/* HiliteColor Menu */}
            <div className="relative">
                <button
                    onMouseDown={(e) => { e.preventDefault(); setActiveMenu(activeMenu === 'highlight' ? null : 'highlight'); }}
                    className={cn("p-1.5 text-white rounded transition-colors flex items-center gap-1", activeMenu === 'highlight' ? "bg-gray-700" : "hover:bg-gray-700")}
                >
                    <div className="w-4 h-4 rounded bg-yellow-300 border border-yellow-400"></div> <ChevronDown size={12} />
                </button>
                {activeMenu === 'highlight' && (
                    <div className="absolute top-full mt-1 left-0 bg-white shadow-xl border border-gray-100 rounded p-2 grid grid-cols-4 gap-1 w-32">
                        <button onMouseDown={(e) => { e.preventDefault(); format('hiliteColor', 'transparent'); }} className="w-6 h-6 rounded border border-gray-200 bg-white text-xs flex items-center justify-center hover:bg-gray-50">X</button>
                        {['#fde047', '#86efac', '#93c5fd', '#fca5a5', '#d8b4fe', '#fdba74'].map(c => (
                            <button key={c} onMouseDown={(e) => { e.preventDefault(); format('hiliteColor', c); }} className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Font Menu */}
            <div className="relative">
                <button
                    onMouseDown={(e) => { e.preventDefault(); setActiveMenu(activeMenu === 'font' ? null : 'font'); }}
                    className={cn("p-1.5 text-white rounded transition-colors flex items-center gap-1", activeMenu === 'font' ? "bg-gray-700" : "hover:bg-gray-700")}
                >
                    <FontIcon size={16} /> <ChevronDown size={12} />
                </button>
                {activeMenu === 'font' && (
                    <div className="absolute top-full mt-1 left-0 bg-white shadow-xl border border-gray-100 rounded p-2 flex flex-col w-32">
                        {FONTS.map(f => (
                            <button key={f} onMouseDown={(e) => { e.preventDefault(); format('fontName', f); }} className="text-xs text-left px-2 py-1.5 hover:bg-gray-100 rounded truncate" style={{ fontFamily: f }}>
                                {f.split(',')[0].replace(/['"]/g, '')}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Sidebar({ isOpen, setIsOpen, pages, activePageId, setActivePageId, createNewPage, setPageToDelete, duplicatePage, setIsSearchOpen, isReadOnly }) {
    const navigate = useNavigate();

    // Render Page Tree (To show nested subpages)
    const rootPages = pages.filter(p => !p.parentId);

    const renderPageTree = (page, level = 0) => {
        const children = pages.filter(p => p.parentId === page.id);
        return (
            <div key={page.id} className="w-full relative group/page">
                <button
                    onClick={() => setActivePageId(page.id)}
                    style={{ paddingLeft: `${0.75 + level * 1}rem`, paddingRight: '0.75rem' }}
                    className={cn(
                        "w-full flex items-center gap-2 py-1.5 text-sm rounded-lg transition-colors font-medium truncate",
                        activePageId === page.id
                            ? "bg-gray-100 text-ink-black font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                    )}
                >
                    <span className="text-gray-400 shrink-0">{page.icon || '📄'}</span>
                    <span className="truncate flex-1 text-left">{page.title.replace(/<[^>]+>/g, '') || 'Untitled'}</span>
                </button>
                {!isReadOnly && (
                    <div className="absolute right-2 top-1.5 opacity-0 group-hover/page:opacity-100 transition-opacity flex items-center gap-1 z-10 bg-white/90 backdrop-blur rounded shadow-sm border border-gray-100 px-1">
                        <button onClick={(e) => { e.stopPropagation(); createNewPage(page.id, null); }} className="p-1 hover:bg-sky-100 text-gray-400 hover:text-deep-blue rounded" title="Add Subpage">
                            <Plus size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }} className="p-1 hover:bg-gray-200 text-gray-400 hover:text-ink-black rounded" title="Duplicate Page">
                            <Copy size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setPageToDelete(page.id); }} className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded" title="Delete Page">
                            <Trash size={14} />
                        </button>
                    </div>
                )}
                {children.length > 0 && (
                    <div className="border-l border-gray-100 ml-4 mt-0.5 mb-1 pl-1">
                        {children.map(child => renderPageTree(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-ink-black/20 z-40 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={cn(
                "fixed md:sticky top-0 left-0 h-screen bg-[#FBFBFA] border-r border-gray-200 z-50 transition-all duration-300 flex flex-col shadow-2xl md:shadow-none shrink-0",
                isOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden"
            )}>

                {/* User Card */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-100/50 cursor-pointer transition-colors mt-2 mx-2 rounded-xl">
                    <div className="flex items-center gap-3 w-full">
                        <img src="/photo.jpg" alt="Avatar" className="w-6 h-6 rounded object-cover shadow-sm bg-gray-200 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="font-bold text-sm text-ink-black truncate">Chanyoung Kim's Workspace</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-2 mt-4 space-y-1">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                        <Home size={16} /> Home Portfolio
                    </button>
                    <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                        <Search size={16} /> Search
                    </button>
                </div>

                {/* Private Pages */}
                <div className="mt-8 px-2 flex-grow overflow-y-auto">
                    <div className="px-3 pb-1 text-xs font-bold text-gray-400 group flex items-center justify-between">
                        <span>Private Pages</span>
                        {!isReadOnly && <Plus size={14} onClick={() => createNewPage(null, null)} className="opacity-0 group-hover:opacity-100 cursor-pointer hover:text-ink-black transition-opacity" />}
                    </div>

                    <div className="space-y-0.5 mt-1 pr-2">
                        {rootPages.map(page => renderPageTree(page, 0))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function NotionPosts() {
    const isReadOnly = !import.meta.env.DEV;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [pageToDelete, setPageToDelete] = useState(null);

    const [pages, setPages] = useState(initialPages);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveData = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/save-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pages)
            });
            const result = await response.json();
            if (result.success) {
                const btn = document.getElementById('save-btn-text');
                if (btn) {
                    btn.innerText = "Saved!";
                    setTimeout(() => { if (btn) btn.innerText = "Save"; }, 2000);
                }
            } else {
                alert("Failed to save posts");
            }
        } catch (error) {
            console.error('Save error:', error);
            alert("Local storage fallback enabled for development");
            localStorage.setItem('portfolio-notion-posts', JSON.stringify(pages));
        }
        setIsSaving(false);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSaveData();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pages]);

    const [activePageId, setActivePageId] = useState(pages[0].id);

    const activePage = pages.find(p => p.id === activePageId);

    // Auto-update title
    useEffect(() => {
        setPages(currentPages =>
            currentPages.map(p => {
                if (p.id === activePageId) {
                    const firstH1 = p.blocks.find(b => b.type === 'h1');
                    const newTitle = firstH1 && firstH1.content ? firstH1.content : "Untitled";
                    return { ...p, title: newTitle };
                }
                return p;
            })
        );
    }, [activePage?.blocks, activePageId]);

    const createNewPage = (parentId = null, triggerBlockId = null) => {
        const newPageId = 'page_' + Date.now();
        const newPage = {
            id: newPageId,
            title: 'Untitled',
            icon: '📄',
            cover: null,
            parentId: parentId,
            blocks: [
                { id: newPageId + '_1', type: 'h1', content: '', focused: true },
                { id: newPageId + '_2', type: 'p', content: '', focused: false }
            ]
        };

        setPages(prev => [...prev, newPage]);

        if (parentId && triggerBlockId) {
            setPages(prev => prev.map(p => {
                if (p.id === parentId) {
                    const newBlocks = p.blocks.map(b =>
                        b.id === triggerBlockId ? { ...b, type: 'page', pageId: newPageId, content: '' } : b
                    );
                    return { ...p, blocks: newBlocks };
                }
                return p;
            }));
        }
        setActivePageId(newPageId);
    };

    const deletePage = () => {
        if (!pageToDelete || pages.length <= 1) {
            setPageToDelete(null);
            return;
        }

        const idsToRemove = new Set([pageToDelete]);
        let sizeBefore = 0;
        while (idsToRemove.size > sizeBefore) {
            sizeBefore = idsToRemove.size;
            pages.forEach(p => {
                if (idsToRemove.has(p.parentId)) idsToRemove.add(p.id);
            });
        }
        const newPages = pages.filter(p => !idsToRemove.has(p.id));
        setPages(newPages);
        if (idsToRemove.has(activePageId)) {
            setActivePageId(newPages[0].id);
        }
        setPageToDelete(null);
    };

    const duplicatePage = (rootPageId) => {
        let newRootId = null;
        const idMap = {};

        const getDescendantsIds = (id, allPages) => {
            const children = allPages.filter(p => p.parentId === id);
            let ids = children.map(c => c.id);
            children.forEach(c => {
                ids = [...ids, ...getDescendantsIds(c.id, allPages)];
            });
            return ids;
        };

        setPages(prev => {
            const rootPage = prev.find(p => p.id === rootPageId);
            if (!rootPage) return prev;

            const pagesToCopy = [rootPage];
            const childrenIds = getDescendantsIds(rootPageId, prev);
            childrenIds.forEach(id => {
                const p = prev.find(c => c.id === id);
                if (p) pagesToCopy.push(p);
            });

            pagesToCopy.forEach(p => {
                if (!idMap[p.id]) {
                    idMap[p.id] = 'page_' + Math.random().toString(36).substring(2, 9) + Date.now();
                }
            });

            newRootId = idMap[rootPageId];

            const newPages = pagesToCopy.map(p => {
                const newId = idMap[p.id];
                const newParentId = p.id === rootPageId ? p.parentId : idMap[p.parentId];
                const newTitle = p.id === rootPageId ? `${p.title} (Copy)` : p.title;

                const newBlocks = p.blocks.map(b => {
                    const mappedBlock = { ...b, id: newId + '_' + Math.random().toString(36).substring(2, 9) };
                    // Update internal links to child pages
                    if (mappedBlock.type === 'page' && mappedBlock.pageId && idMap[mappedBlock.pageId]) {
                        mappedBlock.pageId = idMap[mappedBlock.pageId];
                    }
                    return mappedBlock;
                });

                return {
                    ...p,
                    id: newId,
                    title: newTitle,
                    parentId: newParentId,
                    blocks: newBlocks
                };
            });

            return [...prev, ...newPages];
        });

        setTimeout(() => {
            if (newRootId) setActivePageId(newRootId);
        }, 0);
    };

    const updatePageMetadata = (pageId, modifications) => {
        setPages(prev => prev.map(p => p.id === pageId ? { ...p, ...modifications } : p));
    };

    const updateBlocksForActivePage = (newBlocks) => {
        setPages(pages.map(p => p.id === activePageId ? { ...p, blocks: newBlocks } : p));
    };

    const updateBlock = (id, newProps) => {
        updateBlocksForActivePage(activePage.blocks.map(b => b.id === id ? { ...b, ...newProps } : b));
    };

    const addBlock = (afterIndex) => {
        const newBlock = { id: Date.now().toString(), type: 'p', content: '', focused: true };
        const newBlocks = [...activePage.blocks];
        newBlocks.forEach(b => b.focused = false);
        newBlocks.splice(afterIndex + 1, 0, newBlock);
        updateBlocksForActivePage(newBlocks);
    };

    const insertBlock = (afterIndex, newBlockData) => {
        const newBlock = { id: Date.now().toString(), type: 'p', content: '', focused: false, ...newBlockData };
        const newBlocks = [...activePage.blocks];
        newBlocks.forEach(b => b.focused = false);
        newBlocks.splice(afterIndex + 1, 0, newBlock);
        updateBlocksForActivePage(newBlocks);
    };

    const removeBlock = (index) => {
        if (activePage.blocks.length > 1) {
            const newBlocks = [...activePage.blocks];
            newBlocks.splice(index, 1);
            if (index > 0) {
                newBlocks[index - 1].focused = true;
            } else {
                newBlocks[0].focused = true;
            }
            updateBlocksForActivePage(newBlocks);
        }
    };

    const duplicateBlock = (index) => {
        const newBlock = { ...activePage.blocks[index], id: Date.now().toString() };
        const newBlocks = [...activePage.blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        updateBlocksForActivePage(newBlocks);
    };

    const moveBlock = (dragIndex, hoverIndex) => {
        const draggedBlock = activePage.blocks[dragIndex];
        const newBlocks = [...activePage.blocks];
        newBlocks.splice(dragIndex, 1);
        newBlocks.splice(hoverIndex, 0, draggedBlock);
        updateBlocksForActivePage(newBlocks);
    };

    const setFocus = (index) => {
        updateBlocksForActivePage(activePage.blocks.map((b, i) => ({ ...b, focused: i === index })));
        // Also programmatically focus the wrapper div for non-editable blocks
        setTimeout(() => {
            const wrapper = document.querySelector(`[data-block-index="${index}"]`);
            if (wrapper) {
                // Check if a contenteditable or textarea inside is already focused
                const editable = wrapper.querySelector('[contenteditable="true"], textarea, .npm__react-simple-code-editor__textarea');
                if (editable) {
                    editable.focus();
                } else {
                    wrapper.focus();
                }
            }
        }, 0);
    };

    const [isSelectingText, setIsSelectingText] = useState(false);

    useEffect(() => {
        const handleMouseUp = () => setIsSelectingText(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const enableSelectionMode = () => {
        setIsSelectingText(true);
    };

    // Fun randomizer arrays for add icon/cover
    const ICONS = ['🚀', '👽', '🍔', '🎨', '🔥', '✨', '💻', '💡', '📊', '📈', '🗂️'];
    const COVERS = [
        'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000'
    ];

    const handleAddIcon = () => {
        updatePageMetadata(activePageId, { icon: ICONS[Math.floor(Math.random() * ICONS.length)] });
    };
    const handleAddCover = () => {
        updatePageMetadata(activePageId, { cover: COVERS[Math.floor(Math.random() * COVERS.length)] });
    };

    return (
        <div className="flex h-screen bg-white text-ink-black font-sans overflow-hidden selection:bg-sky-200">
            {!isReadOnly && <FormattingToolbar />}
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                pages={pages}
                activePageId={activePageId}
                setActivePageId={setActivePageId}
                createNewPage={createNewPage}
                setPageToDelete={setPageToDelete}
                duplicatePage={duplicatePage}
                setIsSearchOpen={setIsSearchOpen}
                isReadOnly={isReadOnly}
            />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
                <header className="h-12 border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 bg-white/80 backdrop-blur z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                                title="Open sidebar"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <span className="hover:text-ink-black cursor-pointer transition-colors hover:underline" onClick={() => navigate('/')}>Chanyoung Kim</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-ink-black font-bold truncate max-w-[200px] md:max-w-none">{activePage?.title?.replace(/<[^>]+>/g, '') || 'Untitled'}</span>
                        </div>
                    </div>
                    {!isReadOnly && (
                        <div className="flex items-center">
                            <button onClick={handleSaveData} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-deep-blue text-xs font-bold rounded-lg hover:bg-sky-100 transition-colors border border-sky-100 shadow-sm disabled:opacity-50">
                                <Save size={14} />
                                <span id="save-btn-text">{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {activePage?.cover && (
                        <div className="w-full h-48 md:h-64 relative group">
                            <img src={activePage.cover} alt="Cover" className="w-full h-full object-cover" />
                            {!isReadOnly && (
                                <button onClick={() => updatePageMetadata(activePageId, { cover: null })} className="absolute top-4 right-4 bg-white/80 backdrop-blur text-sm font-bold text-gray-600 px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Change cover</button>
                            )}
                        </div>
                    )}

                    <div className="max-w-[900px] mx-auto w-full px-8 md:px-24 py-16 md:py-32 cursor-text min-h-full" onClick={(e) => {
                        if (e.target === e.currentTarget && activePage.blocks.length > 0 && !isReadOnly) {
                            const lastBlock = activePage.blocks[activePage.blocks.length - 1];
                            if (lastBlock.type === 'p' && lastBlock.content.replace(/<[^>]+>/g, '').trim() === '') {
                                setFocus(activePage.blocks.length - 1);
                            } else {
                                addBlock(activePage.blocks.length - 1);
                            }
                        }
                    }}>

                        <div className="group mb-8 relative">
                            {activePage?.icon && (
                                <div className="text-[5rem] leading-none mb-4 -ml-1 cursor-pointer hover:bg-gray-100 w-fit rounded-lg transition-colors" onClick={!isReadOnly ? handleAddIcon : undefined}>
                                    {activePage.icon}
                                </div>
                            )}
                            {!isReadOnly && (
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                                    {!activePage?.icon && <button onClick={handleAddIcon} className="text-sm font-bold text-gray-400 hover:text-ink-black flex items-center gap-1 transition-colors"><span className="text-lg">😊</span> Add icon</button>}
                                    {!activePage?.cover && <button onClick={handleAddCover} className="text-sm font-bold text-gray-400 hover:text-ink-black flex items-center gap-1 transition-colors"><span className="text-lg">🖼️</span> Add cover</button>}
                                </div>
                            )}
                        </div>

                        <div className="pb-32">
                            {activePage?.blocks.map((block, i) => (
                                <Block
                                    key={block.id}
                                    block={block}
                                    index={i}
                                    updateBlock={updateBlock}
                                    addBlock={addBlock}
                                    insertBlock={insertBlock}
                                    removeBlock={removeBlock}
                                    duplicateBlock={duplicateBlock}
                                    moveBlock={moveBlock}
                                    setFocus={setFocus}
                                    createNewPage={createNewPage}
                                    activePageId={activePageId}
                                    pages={pages}
                                    setActivePageId={setActivePageId}
                                    dragOverIndex={dragOverIndex}
                                    setDragOverIndex={setDragOverIndex}
                                    isReadOnly={isReadOnly}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </main>

            {/* Search Modal overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-ink-black/20 backdrop-blur-sm"
                            onClick={() => setIsSearchOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 border border-gray-100 flex flex-col max-h-[70vh]"
                        >
                            <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-3">
                                <Search className="text-gray-400" size={20} />
                                <input
                                    autoFocus
                                    className="flex-1 bg-transparent border-none outline-none text-ink-black font-medium text-lg placeholder:text-gray-300"
                                    placeholder="Search pages and contents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setIsSearchOpen(false);
                                    }}
                                />
                                <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-ink-black px-2 py-1 text-xs font-bold bg-gray-100 rounded">ESC</button>
                            </div>
                            <div className="overflow-y-auto p-2">
                                {pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.blocks.some(b => b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase()))).map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => { setActivePageId(page.id); setIsSearchOpen(false); setSearchQuery(""); }}
                                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex flex-col gap-1 transition-colors group/result"
                                    >
                                        <div className="flex items-center gap-2 font-bold text-ink-black">
                                            <span>{page.icon || '📄'}</span>
                                            {page.title.replace(/<[^>]+>/g, '') || 'Untitled'}
                                        </div>
                                        <div className="text-xs text-slate-muted pl-6 truncate group-hover/result:text-gray-500">
                                            {page.blocks.find(b => b.type === 'p' && b.content.length > 0)?.content.replace(/<[^>]+>/g, '') || 'No text content available'}
                                        </div>
                                    </button>
                                ))}
                                {pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.blocks.some(b => b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">No result found matching "{searchQuery}"</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {pageToDelete && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-ink-black/20 backdrop-blur-sm"
                            onClick={() => setPageToDelete(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 border border-gray-100 p-6"
                        >
                            <h3 className="text-xl font-bold text-ink-black mb-2 flex items-center gap-2">
                                <Trash className="text-red-500" size={20} /> Delete Page
                            </h3>
                            <p className="text-sm text-slate-muted mb-6">
                                {pages.length <= 1
                                    ? "You cannot delete the last remaining page in your workspace."
                                    : `Are you sure you want to delete "${pages.find(p => p.id === pageToDelete)?.title.replace(/<[^>]+>/g, '') || 'this page'}" and all of its sub-pages? This action cannot be undone.`}
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setPageToDelete(null)}
                                    className="px-4 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                {pages.length > 1 && (
                                    <button
                                        onClick={deletePage}
                                        className="px-4 py-2 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-colors text-sm shadow-sm"
                                    >
                                        Delete Permanently
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
