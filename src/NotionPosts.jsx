import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, ChevronRight, Search, Plus, Settings, Type,
    Heading1, Heading2, Heading3, List, Code as CodeIcon, FunctionSquare,
    GripVertical, Bold, Italic, Palette, Type as FontIcon, FilePlus, ChevronDown, Copy, Trash, FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

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
    { id: 'page', label: 'Page', description: 'Embed a sub-page.', icon: FilePlus },
];

const COLORS = ['#000000', '#E03E3E', '#D9730D', '#0F7B6C', '#0B6E99', '#6940A5', '#e9a3b9'];
const FONTS = ['Inter, sans-serif', 'Georgia, serif', '"Fira Code", monospace', '"Comic Sans MS", cursive'];

const EditableBlock = React.memo(({ html, tagName, className, onChange, onKeyDown, onFocus, placeholder, autoFocus }) => {
    const contentEditable = useRef(null);

    useEffect(() => {
        // Initial content setup to avoid re-renders resetting caret position
        if (contentEditable.current && contentEditable.current.innerHTML === '') {
            contentEditable.current.innerHTML = html;
        }
    }, []);

    useEffect(() => {
        if (contentEditable.current && autoFocus) {
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
    }, [autoFocus]);

    // Sync external changes (commands, formatting updates from parent)
    useEffect(() => {
        if (contentEditable.current && html !== contentEditable.current.innerHTML) {
            if (document.activeElement !== contentEditable.current) {
                contentEditable.current.innerHTML = html;
            }
        }
    }, [html]);

    const emitChange = () => {
        if (contentEditable.current) {
            onChange(contentEditable.current.innerHTML);
        }
    };

    return React.createElement(tagName || 'div', {
        ref: contentEditable,
        className: cn('outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-300', className),
        contentEditable: true,
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
        onFocus,
        placeholder,
        style: { minHeight: '1.5em' }
    });
});

function Block({ block, index, updateBlock, addBlock, removeBlock, setFocus, createNewPage, activePageId, pages, setActivePageId, moveBlock, duplicateBlock, dragOverIndex, setDragOverIndex }) {
    const [showCommands, setShowCommands] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [blockMenuOpen, setBlockMenuOpen] = useState(false);
    const menuListRef = useRef(null);

    const [codeLanguage, setCodeLanguage] = useState('javascript');

    const filteredCommands = COMMAND_MENU_ITEMS.filter(item =>
        item.label.toLowerCase().includes(commandQuery.toLowerCase())
    );

    useEffect(() => {
        if (showCommands && menuListRef.current) {
            const selectedEl = menuListRef.current.children[selectedIndex + 1];
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, showCommands]);

    const handleKeyDown = (e) => {
        if (e.key === '/') {
            setShowCommands(true);
            setCommandQuery('');
            setSelectedIndex(0);
        } else if (showCommands) {
            if (e.key === 'Escape') {
                setShowCommands(false);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    executeCommand(filteredCommands[selectedIndex].id);
                }
            } else if (e.key === 'Backspace' && commandQuery.length === 0) {
                setShowCommands(false);
            }
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
        }
    };

    const handleChange = (htmlVal) => {
        const rawText = htmlVal.replace(/<[^>]+>/g, '');
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

        const rawContent = block.content.replace(/<[^>]+>/g, '');
        const slashIndex = rawContent.lastIndexOf('/');
        const cleanContent = slashIndex !== -1 ? rawContent.substring(0, slashIndex) : rawContent;
        updateBlock(block.id, { type: typeId, content: cleanContent });
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

    return (
        <div
            className={cn(
                "group relative flex items-start -ml-12 pl-12 pr-4 transition-colors mb-1",
                dragOverIndex === index ? "border-t-2 border-blue-500 pt-1" : ""
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div
                className="absolute left-[18px] top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-gray-100 p-1 rounded text-gray-400 flex items-center justify-center select-none"
                contentEditable={false}
                draggable
                onDragStart={onDragStart}
                onClick={() => setBlockMenuOpen(!blockMenuOpen)}
            >
                <GripVertical size={16} />
            </div>

            {blockMenuOpen && (
                <div className="absolute left-[18px] top-8 bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-50 w-48 text-sm" contentEditable={false}>
                    <button onClick={() => { removeBlock(index); setBlockMenuOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-red-600"><Trash size={14} /> Delete</button>
                    <button onClick={() => { duplicateBlock(index); setBlockMenuOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-ink-black"><Copy size={14} /> Duplicate</button>
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
                            <div className="my-4 w-full relative group/math">
                                {block.focused || block.content === '' ? (
                                    <textarea
                                        value={block.content.replace(/<[^>]+>/g, '')}
                                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setFocus(index)}
                                        placeholder="Enter KaTeX equation (e.g., E = mc^2)"
                                        className={cn("w-full resize-none overflow-hidden outline-none bg-gray-50 text-gray-600 font-mono text-sm p-4 rounded-lg border border-gray-200")}
                                        rows={2}
                                    />
                                ) : (
                                    <div
                                        className="py-4 px-8 cursor-text text-center text-lg bg-gray-50/50 rounded-lg border border-transparent hover:border-gray-200 transition-colors w-full"
                                        onClick={() => setFocus(index)}
                                    >
                                        <BlockMath math={block.content.replace(/<[^>]+>/g, '')} errorColor={'#cc0000'} />
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
                                        onFocus={() => setFocus(index)}
                                        autoFocus={block.focused}
                                        placeholder={block.type === 'p' ? (block.content === '' && block.focused ? "Type '/' for commands" : "") : `${block.type === 'h1' ? 'Heading 1' : ''}`}
                                        className={getBlockStyle()}
                                        tagName={block.type === 'h1' ? 'h1' : block.type === 'h2' ? 'h2' : block.type === 'h3' ? 'h3' : 'div'}
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
            </div>
        </div>
    );
}

function FormattingToolbar() {
    const [position, setPosition] = useState({ x: 0, y: 0, show: false });

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
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, []);

    const format = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    if (!position.show) return null;

    return (
        <div
            className="fixed z-50 bg-gray-900 shadow-xl rounded-lg flex items-center px-2 py-1 gap-1 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2"
            style={{ left: position.x, top: position.y }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <button onClick={() => format('bold')} className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors"><Bold size={16} /></button>
            <button onClick={() => format('italic')} className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors"><Italic size={16} /></button>

            <div className="h-4 w-px bg-gray-700 mx-1"></div>

            <div className="relative group/color">
                <button className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors flex items-center gap-1">
                    <Palette size={16} /> <ChevronDown size={12} />
                </button>
                <div className="absolute top-full mt-1 left-0 bg-white shadow-xl border border-gray-100 rounded p-2 hidden group-hover/color:grid grid-cols-4 gap-1 w-32">
                    {COLORS.map(c => (
                        <button key={c} onClick={() => format('foreColor', c)} className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                    ))}
                </div>
            </div>

            <div className="relative group/font">
                <button className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors flex items-center gap-1">
                    <FontIcon size={16} /> <ChevronDown size={12} />
                </button>
                <div className="absolute top-full mt-1 left-0 bg-white shadow-xl border border-gray-100 rounded p-2 hidden group-hover/font:flex flex-col w-32">
                    {FONTS.map(f => (
                        <button key={f} onClick={() => format('fontName', f)} className="text-xs text-left px-2 py-1.5 hover:bg-gray-100 rounded truncate" style={{ fontFamily: f }}>
                            {f.split(',')[0].replace(/['"]/g, '')}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Sidebar({ isOpen, setIsOpen, pages, activePageId, setActivePageId, createNewPage, setPageToDelete, setIsSearchOpen }) {
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
                <div className="absolute right-2 top-1.5 opacity-0 group-hover/page:opacity-100 transition-opacity flex items-center gap-1 z-10">
                    <button onClick={(e) => { e.stopPropagation(); setPageToDelete(page.id); }} className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded" title="Delete Page">
                        <Trash size={14} />
                    </button>
                </div>
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
                        <Plus size={14} onClick={() => createNewPage(null, null)} className="opacity-0 group-hover:opacity-100 cursor-pointer hover:text-ink-black transition-opacity" />
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
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [pageToDelete, setPageToDelete] = useState(null);

    const [pages, setPages] = useState([
        {
            id: 'page1',
            title: 'Technical Research & Post-Mortems',
            icon: '📘',
            cover: null,
            parentId: null,
            blocks: [
                { id: '1', type: 'h1', content: 'Technical Research & Post-Mortems', focused: false },
                { id: '2', type: 'p', content: 'This is my internal knowledge base where I drop quick notes and technical breakdowns of things I build.', focused: false },
                { id: '3', type: 'code', content: "function helloWorld() {\n  console.log('Syntax Highlighting built right in!');\n}", focused: false },
                { id: '4', type: 'p', content: 'Try out the Math Blocks using KaTeX too:', focused: false },
                { id: '5', type: 'math', content: "f(a) = \\frac{1}{2\\pi i} \\oint\\frac{f(z)}{z-a}dz", focused: false },
                { id: '6', type: 'p', content: 'Try typing / to see the command menu!', focused: true }
            ]
        },
        {
            id: 'page2',
            title: 'AML Modeling Notes',
            icon: '🛡️',
            cover: null,
            parentId: null,
            blocks: [
                { id: '1', type: 'h1', content: 'Anti-Money Laundering Algorithms', focused: false },
                { id: '2', type: 'p', content: 'Notes regarding network graph optimization.', focused: true }
            ]
        }
    ]);

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
            <FormattingToolbar />
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                pages={pages}
                activePageId={activePageId}
                setActivePageId={setActivePageId}
                createNewPage={createNewPage}
                setPageToDelete={setPageToDelete}
                setIsSearchOpen={setIsSearchOpen}
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
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {activePage?.cover && (
                        <div className="w-full h-48 md:h-64 relative group">
                            <img src={activePage.cover} alt="Cover" className="w-full h-full object-cover" />
                            <button onClick={() => updatePageMetadata(activePageId, { cover: null })} className="absolute top-4 right-4 bg-white/80 backdrop-blur text-sm font-bold text-gray-600 px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Change cover</button>
                        </div>
                    )}

                    <div className="max-w-[900px] mx-auto w-full px-8 md:px-24 py-16 md:py-32 cursor-text min-h-full" onClick={(e) => {
                        if (e.target === e.currentTarget && activePage.blocks.length > 0) {
                            setFocus(activePage.blocks.length - 1);
                        }
                    }}>

                        <div className="group mb-8 relative">
                            {activePage?.icon && (
                                <div className="text-[5rem] leading-none mb-4 -ml-1 cursor-pointer hover:bg-gray-100 w-fit rounded-lg transition-colors" onClick={handleAddIcon}>
                                    {activePage.icon}
                                </div>
                            )}
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                                {!activePage?.icon && <button onClick={handleAddIcon} className="text-sm font-bold text-gray-400 hover:text-ink-black flex items-center gap-1 transition-colors"><span className="text-lg">😊</span> Add icon</button>}
                                {!activePage?.cover && <button onClick={handleAddCover} className="text-sm font-bold text-gray-400 hover:text-ink-black flex items-center gap-1 transition-colors"><span className="text-lg">🖼️</span> Add cover</button>}
                            </div>
                        </div>

                        <div className="pb-32">
                            {activePage?.blocks.map((block, i) => (
                                <Block
                                    key={block.id}
                                    block={block}
                                    index={i}
                                    updateBlock={updateBlock}
                                    addBlock={addBlock}
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
