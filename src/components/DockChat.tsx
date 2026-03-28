'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Bot, User, MapPin, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getAllWasteListings, type WasteListingPublic } from '../lib/db';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    listings?: WasteListingPublic[];
}

const initialMessages: ChatMessage[] = [
    {
        id: '1',
        text: 'Hello! I am your AI assistant for the waste management platform. I can help you find sellers, provide information about projects, or answer questions about materials. How can I assist you today?',
        sender: 'bot'
    }
];

interface DockChatProps {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    buttonSize?: number;
    chatWidth?: number;
    chatHeight?: number;
    title?: string;
    subtitle?: string;
    buttonColor?: string;
    className?: string;
    onOpenChange?: (open: boolean) => void;
}

export const DockChat: React.FC<DockChatProps> = ({
    position = 'bottom-right',
    buttonSize = 56,
    chatWidth = 360,
    chatHeight = 500,
    title = "AI Assistant",
    subtitle = "How can we help you today?",
    buttonColor = "#10b981", // brand-500
    className,
    onOpenChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const saved = localStorage.getItem('ai_chat_memory');
            return saved ? JSON.parse(saved) : initialMessages;
        } catch (e) {
            return initialMessages;
        }
    });
    const [input, setInput] = useState('');
    const [allListings, setAllListings] = useState<WasteListingPublic[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        try {
            localStorage.setItem('ai_chat_memory', JSON.stringify(messages));
        } catch (e) {
            console.error('Failed to save chat memory', e);
        }
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        getAllWasteListings(100).then(res => setAllListings(res));
    }, []);

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onOpenChange?.(newState);
    };

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        const userMsg: ChatMessage = { id: Date.now().toString(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate bot response
        setTimeout(() => {
            let botReply = "I'm looking into that for you. As an AI assistant, I can connect you with sellers or analyze your project needs.";
            let matchedListings: WasteListingPublic[] = [];

            const lowerInput = userText.toLowerCase();

            if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botReply = "Hi there! Feel free to ask me anything related to industrial waste sourcing and sales.";
            } else if (lowerInput.includes('saw dust') || lowerInput.includes('sawdust')) {
                botReply = "Sawdust is highly versatile! You can generate several valuable products from it, including: \n1. Particleboard and MDF for furniture.\n2. Biomass fuel briquettes or pellets.\n3. Animal bedding and agricultural compost.\n4. Wood pulp for certain paper products.";
            } else if (lowerInput.includes('plastic') && (lowerInput.includes('generate') || lowerInput.includes('make') || lowerInput.includes('do with'))) {
                botReply = "Plastic waste can be recycled into various items such as:\n1. Recycled PET pellets for new bottles or packaging.\n2. Synthetic fibers for clothing (like polyester).\n3. Eco-bricks or construction materials.\n4. 3D printing filament.";
            } else if (lowerInput.includes('generate') || lowerInput.includes('make') || lowerInput.includes('do with')) {
                botReply = "That depends heavily on the material! For instance, organic waste can be turned into biogas or compost, while metals can be smelted down endlessly without losing quality. Could you specify which waste material you have in mind?";
            } else if (lowerInput.includes('project') || lowerInput.includes('info')) {
                botReply = "Your current project involves sourcing secondary materials to reduce carbon footprint. Reusing industrial waste can save up to 45% in operational costs.";
            } else {
                // Try to find material matches
                const searchKeywords = lowerInput.replace(/buy|seller|find|need|want/g, '').trim().split(' ').filter(w => w.length > 2);

                matchedListings = allListings.filter(l => {
                    const materialStr = `${l.waste_type} ${l.description || ''}`.toLowerCase();
                    return searchKeywords.some(kw => materialStr.includes(kw));
                });

                // Sort by price if possible
                matchedListings.sort((a, b) => (a.price_per_unit || Infinity) - (b.price_per_unit || Infinity));

                // Limit to top 3
                matchedListings = matchedListings.slice(0, 3);

                if (matchedListings.length > 0) {
                    botReply = "I found some potential sellers for you based on material, location, and price. Here are the top matches:";
                } else {
                    botReply = "I couldn't find any exact matches for that right now. Could you provide a different material name or specify the type of waste you're looking for?";
                }
            }

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: botReply,
                sender: 'bot',
                listings: matchedListings.length > 0 ? matchedListings : undefined
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    const positionClasses = {
        'bottom-right': 'bottom-8 right-8',
        'bottom-left': 'bottom-8 left-8',
        'top-right': 'top-8 right-8',
        'top-left': 'top-8 left-8'
    };

    const chatPositionClasses = {
        'bottom-right': 'bottom-24 right-8',
        'bottom-left': 'bottom-24 left-8',
        'top-right': 'top-24 right-8',
        'top-left': 'top-24 left-8'
    };

    return (
        <div className={cn("fixed z-50 pointer-events-none inset-0", className)}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className={cn(
                            "absolute pointer-events-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden",
                            chatPositionClasses[position]
                        )}
                        style={{ width: chatWidth, height: chatHeight }}
                    >
                        <div
                            className="p-4 text-white flex justify-between items-center shrink-0"
                            style={{ backgroundColor: buttonColor }}
                        >
                            <div>
                                <h4 className="font-semibold">{title}</h4>
                                <p className="text-xs opacity-80">{subtitle}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setMessages(initialMessages);
                                        localStorage.removeItem('ai_chat_memory');
                                    }}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors text-xs font-semibold"
                                >
                                    Clear
                                </button>
                                <button onClick={handleToggle} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Content */}
                        <div className="flex-1 flex flex-col min-h-0 bg-surface-50">
                            {/* Messages Area */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-surface-200 text-surface-600' : 'bg-brand-100 text-brand-600'}`}>
                                            {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <div className={`rounded-xl p-3 max-w-[80%] shadow-sm ${msg.sender === 'user' ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-white border border-surface-200 text-surface-800 rounded-tl-sm'}`}>
                                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                
                                {messages[messages.length - 1]?.listings?.map((listing: WasteListingPublic) => (
                                    <div key={listing.id} className={`ml-10 max-w-[80%] bg-white border border-surface-200 rounded-xl p-3 shadow-sm hover:border-brand-300 transition-colors`}>
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div>
                                                <h4 className="font-bold text-[13px] text-surface-900 capitalize flex items-center gap-1.5">
                                                    <Package size={14} className="text-brand-500" />
                                                    {listing.waste_type.replace(/_/g, ' ')}
                                                </h4>
                                                <p className="text-[11px] text-surface-500 font-medium">{listing.companies?.company_name || 'Verified Seller'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-surface-500 font-medium mb-3">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {listing.listing_location || listing.companies?.location || 'Unknown'}</span>
                                            <span>•</span>
                                            <span>{listing.quantity} {listing.unit}</span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/app/messages?partnerId=${listing.company_id}`)}
                                            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-[12px] transition-colors"
                                        >
                                            <MessageSquare size={12} />
                                            Chat
                                        </button>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 border-t border-surface-200 bg-white shrink-0">
                                <form onSubmit={handleSend} className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-full p-1 pl-3">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-surface-900"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim()}
                                        className="p-1.5 rounded-full text-white disabled:opacity-50 disabled:bg-surface-300 transition-colors shrink-0"
                                        style={{ backgroundColor: input.trim() ? buttonColor : undefined }}
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className={cn(
                    "absolute pointer-events-auto flex items-center z-20",
                    positionClasses[position]
                )}
            >
                <AnimatePresence>
                </AnimatePresence>

                <motion.button
                    onClick={handleToggle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative rounded-full shadow-xl flex items-center justify-center text-white transition-colors border-[3px]"
                    style={{
                        width: buttonSize,
                        height: buttonSize,
                        backgroundColor: isOpen ? buttonColor : '#1a1a1a',
                        borderColor: isOpen ? buttonColor : '#ff1cf7'
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X size={24} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="w-full h-full rounded-full overflow-hidden flex items-center justify-center p-0.5"
                            >
                                <img 
                                    src="/ai_avatar.png" 
                                    alt="AI Assistant" 
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
};
