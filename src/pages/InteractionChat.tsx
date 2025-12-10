
import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { aiService } from '../services/ai.service'
import { Character } from '../components/game/CharacterCreationWizard'
import { DiceRoller } from '../components/game/DiceRoller'
import './InteractionChat.css'

interface Message {
    id: string
    sender: 'player' | 'master' | 'system'
    content: string
    timestamp: number
}

function CharacterCard({ character }: { character: Character }) {
    const [tab, setTab] = useState<'avatar' | 'desc' | 'attr' | 'skills' | 'items'>('avatar');

    const btnStyle = (active: boolean) => ({
        flex: 1,
        border: 'none',
        background: active ? '#0f0' : '#222',
        color: active ? '#000' : '#888',
        cursor: 'pointer',
        padding: '0.3rem',
        fontSize: '1rem',
        clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)',
        margin: '0 1px'
    });

    return (
        <div style={{ padding: '0.5rem', border: '1px solid #333', background: '#111', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <button onClick={() => setTab('avatar')} style={btnStyle(tab === 'avatar')} title="Avatar">☻</button>
                <button onClick={() => setTab('desc')} style={btnStyle(tab === 'desc')} title="Descrição">≡</button>
                <button onClick={() => setTab('attr')} style={btnStyle(tab === 'attr')} title="Atributos">╬</button>
                <button onClick={() => setTab('skills')} style={btnStyle(tab === 'skills')} title="Habilidades">†</button>
                <button onClick={() => setTab('items')} style={btnStyle(tab === 'items')} title="Itens">⚒</button>
            </div>

            {/* Content */}
            <div style={{ minHeight: '150px', fontSize: '0.75rem' }}>
                {tab === 'avatar' && (
                    <div className="char-fade-in">
                        {character.avatar_url && (
                            <img src={character.avatar_url} alt="Avatar" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', imageRendering: 'pixelated', marginBottom: '0.5rem', border: '1px solid #333' }} />
                        )}
                        <div style={{ color: '#0f0', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>{character.name}</div>
                        <div style={{ marginTop: '0.5rem', fontFamily: 'monospace' }}>
                            <div style={{ color: '#fb4934' }}>HP: [♥♥♥♥♥♥♥♥♥♥] 100%</div>
                            <div style={{ color: '#83a598' }}>MP: [■■■■■.....] 50%</div>
                        </div>
                    </div>
                )}

                {tab === 'desc' && (
                    <div className="char-fade-in" style={{ color: '#aaa' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: '#fff' }}>Origem:</strong><br />
                            {character.origin_description}
                        </div>
                        <div>
                            <strong style={{ color: '#fff' }}>Físico:</strong><br />
                            {character.physical_description}
                        </div>
                    </div>
                )}

                {tab === 'attr' && (
                    <div className="char-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#ccc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '0.2rem' }}>
                            <span>BRUTO</span>
                            <span style={{ color: '#fff' }}>{character.attributes.physical.brute}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '0.2rem' }}>
                            <span>FLUIDO</span>
                            <span style={{ color: '#fff' }}>{character.attributes.physical.fluid}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '0.2rem' }}>
                            <span>INTELECTO</span>
                            <span style={{ color: '#fff' }}>{character.attributes.mental.intelligence}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '0.2rem' }}>
                            <span>INSTINTO</span>
                            <span style={{ color: '#fff' }}>{character.attributes.mental.instinct}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '0.2rem' }}>
                            <span>PRESENÇA</span>
                            <span style={{ color: '#fff' }}>{character.attributes.social.presence}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '0.2rem' }}>
                            <span>SUTILEZA</span>
                            <span style={{ color: '#fff' }}>{character.attributes.social.subtlety}</span>
                        </div>
                    </div>
                )}

                {tab === 'skills' && (
                    <div className="char-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {/* Passive */}
                        <div style={{ borderLeft: '2px solid #aaa', paddingLeft: '0.3rem' }}>
                            <div style={{ color: '#fff' }}>{character.skills.passive} (P)</div>
                            <div style={{ color: '#666', fontStyle: 'italic' }}>{character.skills.details?.passive?.effect || 'Sem efeito'}</div>
                        </div>
                        {/* Active 1 */}
                        <div style={{ borderLeft: '2px solid #0f0', paddingLeft: '0.3rem' }}>
                            <div style={{ color: '#0f0' }}>{character.skills.active1}</div>
                            <div style={{ color: '#888' }}>{character.skills.details?.active1?.effect}</div>
                            <div style={{ color: '#f0f', fontSize: '0.65rem' }}>Custo: {character.skills.details?.active1?.cost}</div>
                        </div>
                        {/* Active 2 */}
                        <div style={{ borderLeft: '2px solid #0f0', paddingLeft: '0.3rem' }}>
                            <div style={{ color: '#0f0' }}>{character.skills.active2}</div>
                            <div style={{ color: '#888' }}>{character.skills.details?.active2?.effect}</div>
                            <div style={{ color: '#f0f', fontSize: '0.65rem' }}>Custo: {character.skills.details?.active2?.cost}</div>
                        </div>
                    </div>
                )}

                {tab === 'items' && character.skills.equipment && (
                    <div className="char-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ border: '1px solid #333', padding: '0.3rem' }}>
                            <div style={{ color: '#fabd2f' }}>⚒ {character.skills.equipment.weapon.name}</div>
                            <div style={{ color: '#888' }}>{character.skills.equipment.weapon.effect}</div>
                            <div style={{ color: '#666' }}>Attr: {character.skills.equipment.weapon.attribute}</div>
                        </div>
                        <div style={{ border: '1px solid #333', padding: '0.3rem' }}>
                            <div style={{ color: '#83a598' }}>□ {character.skills.equipment.armor.name}</div>
                            <div style={{ color: '#888' }}>{character.skills.equipment.armor.effect}</div>
                            <div style={{ color: '#666' }}>AC: {character.skills.equipment.armor.ac}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function InteractionChat() {
    const { campaignId } = useParams()
    const { state } = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [character, setCharacter] = useState<Character | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [loading, setLoading] = useState(true)
    const [aiThinking, setAiThinking] = useState(false)
    const [diceCount, setDiceCount] = useState(1)
    const [isRolling, setIsRolling] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const handleRoll = () => {
        if (isRolling) return
        setIsRolling(true)
        console.log(`Rolling ${diceCount} dice...`)
        // Future: Implement actual roll logic here
    }

    const [summary, setSummary] = useState<string>('')
    const [campaign, setCampaign] = useState<any>(null)

    useEffect(() => {
        if (!state?.characterId || !campaignId) {
            navigate('/campaign-selection')
            return
        }
        fetchData(state.characterId, campaignId)
        loadChatHistory()
    }, [])

    const fetchData = async (charId: string, campId: string) => {
        const { data: charData } = await supabase.from('characters').select('*').eq('id', charId).single()
        if (charData) setCharacter(charData)

        const { data: campData } = await supabase.from('campaigns').select('*').eq('id', campId).single()
        if (campData) setCampaign(campData)
    }

    const loadChatHistory = async () => {
        if (!campaignId) return;

        // 1. Get Summary
        const { data: summaryData } = await supabase
            .from('context_summaries')
            .select('summary') // Fixed: summary_text -> summary
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(); // Fixed: single() -> maybeSingle() to avoid 406 on empty

        if (summaryData) setSummary(summaryData.summary);

        // 2. Get Messages
        const { data: msgData } = await supabase
            .from('messages')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: true }); // ASC for display

        if (msgData && msgData.length > 0) {
            const formatted: Message[] = msgData.map(m => {
                // Map DB roles (user/assistant) to UI roles (player/master)
                let sender: 'player' | 'master' | 'system' = 'system';
                if (m.role === 'user') sender = 'player';
                else if (m.role === 'assistant') sender = 'master';
                else if (m.role === 'system') sender = 'system';

                return {
                    id: m.id,
                    sender,
                    content: m.content,
                    timestamp: new Date(m.created_at).getTime()
                };
            });
            setMessages(formatted);
        } else {
            // Initial Welcome
            const initialMsg: Message = {
                id: 'init',
                sender: 'system',
                content: 'CONEXÃO ESTABELECIDA. INTERFACE NEURAL ATIVA. DIGITE [INICIAR]...',
                timestamp: Date.now()
            };
            setMessages([initialMsg]);
        }
        setLoading(false);
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!inputValue.trim() || aiThinking || !campaignId) return

        const userContent = inputValue;
        setInputValue('')
        setAiThinking(true)

        // Optimistic UI update
        const tempUserMsg: Message = {
            id: Date.now().toString(),
            sender: 'player',
            content: userContent,
            timestamp: Date.now()
        }
        setMessages(prev => [...prev, tempUserMsg])

        try {
            // 1. Save User Message
            // DB expects 'user' role, not 'player'
            const { error: msgError } = await supabase.from('messages').insert({
                campaign_id: campaignId,
                user_id: user?.id, // Added user_id
                role: 'user',
                content: userContent
            });

            if (msgError) console.error("Error saving user message:", msgError);

            // 2. Check for Summary Trigger (every 15 msgs)
            if (messages.length > 0 && messages.length % 15 === 0) {
                console.log("Creating narrative summary...");
                const recent = messages.slice(-15);
                const newSummary = await aiService.generateSummary(recent, summary);

                await supabase.from('context_summaries').insert({
                    campaign_id: campaignId,
                    summary: newSummary
                });
                setSummary(newSummary);
            }

            // 3. Call AI Master with Context
            const response = await aiService.generateMasterInteraction(
                userContent,
                {
                    character,
                    campaign
                },
                { summary, recentMessages: messages.slice(-10) }
            );

            // 4. Save AI/Master Message
            // DB expects 'assistant' role for Master
            const { error: aiError } = await supabase.from('messages').insert({
                campaign_id: campaignId,
                user_id: user?.id, // Added user_id
                role: 'assistant',
                content: response
            });

            if (aiError) console.error("Error saving AI message:", aiError);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'master',
                content: response,
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, aiMsg])

        } catch (error) {
            console.error("AI Error:", error)
            const errorMsg: Message = {
                id: Date.now().toString(),
                sender: 'system',
                content: 'ERRO NA TRANSMISSÃO DE DADOS. TENTE NOVAMENTE.',
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setAiThinking(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (loading) return <div className="interaction-container"><div style={{ color: '#0f0' }}>CARREGANDO INTERFACE...</div></div>

    return (
        <div className="interaction-container">
            {/* Zone 1: Party (Left) */}
            <div className="ac-party-panel">
                <h3 style={{ color: '#fff', borderBottom: '1px solid #555', paddingBottom: '0.5rem', fontSize: '0.8rem' }}>GRUPO</h3>
                {character && <CharacterCard character={character} />}
            </div>

            {/* Zone 2: Monitor (Center Top) */}
            <div className="ac-monitor-panel">
                {messages.map((msg, idx) => (
                    <div key={msg.id} className={`ac - message ${msg.sender} `}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.2rem' }}>
                            {msg.sender === 'player' ? character?.name : msg.sender === 'master' ? 'MESTRE' : 'SISTEMA'}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    </div>
                ))}
                {aiThinking && (
                    <div className="ac-message master" style={{ opacity: 0.7 }}>
                        <span className="blink">Processando resposta...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Zone 3: Terminal (Center Bottom) */}
            <div className="ac-terminal-panel">
                <div className="ac-terminal-input-area">
                    <div className="ac-terminal-prompt">&gt;</div>
                    <textarea
                        className="ac-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua ação..."
                        autoFocus
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        style={{ background: '#0f0', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', padding: '0 1rem' }}
                        disabled={aiThinking}
                    >
                        ENV
                    </button>
                </div>
            </div>

            {/* Zone 4: Environment (Right Top) */}
            <div className="ac-environment-panel">
                <h4 style={{ margin: 0, color: '#0ff', fontSize: '0.8rem' }}>AMBIENTE</h4>
                <div style={{ margin: '1rem 0', fontSize: '0.8rem' }}>
                    <p>LOCAL: Desconhecido</p>
                    <p>CLIMA: Estático</p>
                    <p>QUEST ATUAL: Sobreviver</p>
                </div>
                <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
                    <h5 style={{ margin: 0, color: '#f00', fontSize: '0.8rem' }}>AMEAÇAS</h5>
                    <p style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#555' }}>Nenhuma detectada.</p>
                </div>
            </div>

            {/* Zone 5: Dice Roller (Right Bottom) */}
            <div className="ac-dice-panel">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>

                    {/* Header with Icon and Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', color: '#666', fontSize: '0.8rem', width: '100%', justifyContent: 'center', borderBottom: '1px dashed #444', paddingBottom: '0.5rem' }}>
                        <span role="img" aria-label="D20 Icon" style={{ fontSize: '1.2rem' }}>🎲</span>
                        <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>ROLAGEM DE DADOS</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            className="ac-dice-btn"
                            onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                            disabled={diceCount <= 1}
                            style={{ opacity: diceCount <= 1 ? 0.3 : 1, cursor: diceCount <= 1 ? 'not-allowed' : 'pointer' }}
                        >
                            ◄
                        </button>
                        <div className="ac-digit-display">
                            {diceCount}
                        </div>
                        <button
                            className="ac-dice-btn"
                            onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
                            disabled={diceCount >= 10}
                            style={{ opacity: diceCount >= 10 ? 0.3 : 1, cursor: diceCount >= 10 ? 'not-allowed' : 'pointer' }}
                        >
                            ►
                        </button>
                    </div>
                    <button className="ac-roll-btn" onClick={handleRoll} disabled={isRolling}>
                        {isRolling ? 'ROLANDO...' : 'ROLAR'}
                    </button>
                </div>
            </div>

            <DiceRoller
                active={isRolling}
                count={diceCount}
                onComplete={(successes) => {
                    setIsRolling(false)
                    setInputValue(`Obtive ${successes} sucesso(s) na rolagem.`)
                }}
            />
        </div>
    )
}
