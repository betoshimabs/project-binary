
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { aiService } from '../../services/ai.service'
import { useAuth } from '../../hooks/useAuth'

export interface Character {
    id: string
    campaign_id: string | null
    name: string
    physical_description: string
    origin_description: string
    attributes: {
        physical: { brute: number, fluid: number }
        mental: { intelligence: number, instinct: number }
        social: { presence: number, subtlety: number }
    }
    skills: {
        passive: string
        active1: string
        active2: string
        details?: {
            passive: { effect: string, cost: string }
            active1: { effect: string, cost: string }
            active2: { effect: string, cost: string }
        }
        equipment?: {
            weapon: { name: string, attribute: string, effect: string }
            armor: { name: string, ac: string, effect: string }
        }
    }
    avatar_url: string | null
}

interface Campaign {
    id: string
    title: string
}

interface CharacterCreationWizardProps {
    existingCharacter?: Character | null
    initialCampaignId?: string
    onCancel: () => void
    onComplete: () => void
}

export function CharacterCreationWizard({ existingCharacter, initialCampaignId, onCancel, onComplete }: CharacterCreationWizardProps) {
    const { user } = useAuth()
    const [step, setStep] = useState(1)
    const [generating, setGenerating] = useState(false)
    const [campaigns, setCampaigns] = useState<Campaign[]>([])

    // Form State
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>(initialCampaignId || '')
    const [name, setName] = useState('')
    const [physDesc, setPhysDesc] = useState('')
    const [originDesc, setOriginDesc] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    // Attributes
    const [brute, setBrute] = useState(4)
    const [fluid, setFluid] = useState(4)
    const [int, setInt] = useState(4)
    const [inst, setInst] = useState(4)
    const [pres, setPres] = useState(4)
    const [subt, setSubt] = useState(4)

    // Skills
    const [passive, setPassive] = useState('')
    const [active1, setActive1] = useState('')
    const [active2, setActive2] = useState('')
    const [skillDetails, setSkillDetails] = useState({
        passive: { effect: '', cost: '' },
        active1: { effect: '', cost: '' },
        active2: { effect: '', cost: '' }
    })
    const [equipment, setEquipment] = useState<{
        weapon: { name: string, attribute: string, effect: string },
        armor: { name: string, ac: string, effect: string }
    }>({
        weapon: { name: '', attribute: '', effect: '' },
        armor: { name: '', ac: '', effect: '' }
    })

    useEffect(() => {
        const fetchCampaigns = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            const userId = user?.id

            const { data, error } = await supabase
                .from('campaigns')
                .select('id, title')
                .or(`is_public.eq.true${userId ? `,user_id.eq.${userId}` : ''}`)
                .order('created_at', { ascending: false })
            if (!error && data) setCampaigns(data)
        }
        fetchCampaigns()
    }, [])

    useEffect(() => {
        // Enforce attribute sums
        setFluid(8 - brute)
        setInst(8 - int)
        setSubt(8 - pres)
    }, [brute, int, pres])

    useEffect(() => {
        if (existingCharacter) {
            setName(existingCharacter.name)
            setSelectedCampaignId(existingCharacter.campaign_id || '')
            setPhysDesc(existingCharacter.physical_description)
            setOriginDesc(existingCharacter.origin_description)
            setBrute(existingCharacter.attributes.physical.brute)
            setInt(existingCharacter.attributes.mental.intelligence)
            setPres(existingCharacter.attributes.social.presence)
            setPassive(existingCharacter.skills.passive)
            setActive1(existingCharacter.skills.active1)
            setActive2(existingCharacter.skills.active2)
            setAvatarUrl(existingCharacter.avatar_url)

            if (existingCharacter.skills.details) setSkillDetails(existingCharacter.skills.details)
            if (existingCharacter.skills.equipment) setEquipment(existingCharacter.skills.equipment)
        }
    }, [existingCharacter])

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault()
        if (step === 3) {
            await generateAiContent()
        } else {
            setStep(prev => prev + 1)
        }
    }

    const generateAiContent = async () => {
        setGenerating(true)
        try {
            const rulesSummary = "RPG Minimalista, d8 dados. Sucessos em pares. Atributos: Físico (Bruto/Fluido), Mental (Inteligência/Instinto), Social (Presença/Sutileza)."
            const currentCampaign = campaigns.find(c => c.id === selectedCampaignId)
            const characterData = {
                name,
                physical_description: physDesc,
                origin_description: originDesc,
                attributes: {
                    physical: { brute, fluid },
                    mental: { intelligence: int, instinct: inst },
                    social: { presence: pres, subtlety: subt }
                }
            }

            try {
                const generatedData = await aiService.generateCharacterSkills(
                    rulesSummary,
                    currentCampaign,
                    characterData,
                    { passive, active1, active2 }
                )
                const { equipment, ...skills } = generatedData
                setSkillDetails(skills)
                if (equipment) setEquipment(equipment)
            } catch (err) {
                console.error("Erro ao gerar habilidades", err)
                alert("Erro ao gerar habilidades. Tente novamente.")
                return
            }

            try {
                // @ts-ignore
                const base64Image = await aiService.generateCharacterAvatar({
                    name,
                    physical_description: physDesc,
                    origin_description: originDesc
                })
                const blob = await (await fetch(`data:image/png;base64,${base64Image}`)).blob()
                const fileName = `${Date.now()}_${name.replace(/\s+/g, '_')}.png`

                const { error } = await supabase.storage
                    .from('characters_avatar')
                    .upload(fileName, blob, { upsert: true })

                if (error) {
                    console.error('Upload Error:', error)
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from('characters_avatar')
                        .getPublicUrl(fileName)
                    setAvatarUrl(publicUrlData.publicUrl)
                }
            } catch (imgError) {
                console.warn("Falha na geração de imagem", imgError)
            }

            setStep(4)
        } catch (error) {
            console.error(error)
            alert('Erro Geral na IA: ' + (error as Error).message)
        } finally {
            setGenerating(false)
        }
    }

    const handleConfirmSave = async () => {
        if (!user) return

        const attributes = {
            physical: { brute, fluid },
            mental: { intelligence: int, instinct: inst },
            social: { presence: pres, subtlety: subt }
        }

        const skills = {
            passive,
            active1,
            active2,
            details: skillDetails,
            equipment
        }

        try {
            let characterId = existingCharacter?.id

            if (existingCharacter) {
                // @ts-ignore
                const { error } = await supabase.from('characters').update({
                    name,
                    campaign_id: selectedCampaignId || null,
                    physical_description: physDesc,
                    origin_description: originDesc,
                    attributes,
                    skills,
                    avatar_url: avatarUrl
                }).eq('id', existingCharacter.id)
                if (error) throw error
            } else {
                // @ts-ignore
                const { data, error } = await supabase.from('characters').insert({
                    user_id: user.id,
                    campaign_id: selectedCampaignId || null,
                    name,
                    physical_description: physDesc,
                    origin_description: originDesc,
                    attributes,
                    skills,
                    description: physDesc,
                    avatar_url: avatarUrl
                }).select().single()

                if (error) throw error
                characterId = data.id
            }

            if (equipment.weapon.name || equipment.armor.name) {
                const itemsToInsert = []
                if (equipment.weapon.name) {
                    itemsToInsert.push({
                        user_id: user.id,
                        character_id: characterId,
                        name: equipment.weapon.name,
                        type: 'weapon',
                        effect: equipment.weapon.effect,
                        data: { attribute: equipment.weapon.attribute }
                    })
                }
                if (equipment.armor.name) {
                    itemsToInsert.push({
                        user_id: user.id,
                        character_id: characterId,
                        name: equipment.armor.name,
                        type: 'armor',
                        effect: equipment.armor.effect,
                        data: { ac: equipment.armor.ac }
                    })
                }
                if (itemsToInsert.length > 0) {
                    // @ts-ignore
                    const { error: itemsError } = await supabase.from('items').insert(itemsToInsert)
                    if (itemsError) console.error("Error saving items:", itemsError)
                }
            }

            onComplete()
        } catch (err) {
            console.error(err)
            alert('Erro ao salvar')
        }
    }

    const renderStepTracker = () => (
        <div className="step-tracker">
            {[1, 2, 3, 4].map(s => {
                let className = 'step-led'
                if (s === step) className += ' active'
                else if (s < step) className += ' completed'
                return <div key={s} className={className} title={`Passo ${s}`} />
            })}
        </div>
    )

    const renderSlider = (labelLeft: string, valLeft: number, labelRight: string, valRight: number, setter: (v: number) => void, tooltip: string) => (
        <div className="attribute-slider-container" title={tooltip}>
            <div className="slider-labels">
                <span>{labelLeft} ({valLeft})</span>
                <span>({valRight}) {labelRight}</span>
            </div>
            <input type="range" min="1" max="7" value={valLeft} onChange={e => setter(Number(e.target.value))} />
        </div>
    )

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>CAMPANHA:</label>
                            <select
                                value={selectedCampaignId}
                                onChange={e => setSelectedCampaignId(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }}
                            >
                                <option value="">-- Selecione uma Campanha --</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>NOME (Max 16):</label>
                            <input type="text" maxLength={16} value={name} onChange={e => setName(e.target.value)} required
                                placeholder="Ex: Cyber-Samurai"
                                style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label>DESC. FÍSICA (Max 128):</label>
                                <textarea maxLength={128} value={physDesc} onChange={e => setPhysDesc(e.target.value)} required rows={3}
                                    placeholder="Ex: Alto, cibernético, braço de neon."
                                    style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }} />
                            </div>
                            <div>
                                <label>DESC. ORIGEM (Max 128):</label>
                                <textarea maxLength={128} value={originDesc} onChange={e => setOriginDesc(e.target.value)} required rows={3}
                                    placeholder="Ex: Ex-soldado de Neo-Tokyo."
                                    style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }} />
                            </div>
                        </div>
                    </>
                )
            case 2:
                return (
                    <>
                        <h4>ATRIBUTOS (Total 8 por Eixo)</h4>
                        <div style={{ marginBottom: '1rem', border: '1px solid #333', padding: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                {renderSlider("BRUTO", brute, "FLUIDO", fluid, setBrute, "Bruto: Força/Resistência | Fluido: Agilidade/Destreza")}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                {renderSlider("INTELIGÊNCIA", int, "INSTINTO", inst, setInt, "Inteligência: Lógica/Conhecimento | Instinto: Percepção/Reflexos")}
                            </div>
                            <div>
                                {renderSlider("PRESENÇA", pres, "SUTILEZA", subt, setPres, "Presença: Liderança/Intimidação | Sutileza: Enganação/Furtividade")}
                            </div>
                        </div>
                    </>
                )
            case 3:
                return (
                    <>
                        <h4>HABILIDADES (Max 32 chars)</h4>
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label>PASSIVA (Sempre ativa):</label>
                                <input type="text" maxLength={32} value={passive} onChange={e => setPassive(e.target.value)} required
                                    placeholder="Ex: Visão Noturna"
                                    style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>ATIVA 1 (Gasta Mana):</label>
                                    <input type="text" maxLength={32} value={active1} onChange={e => setActive1(e.target.value)} required
                                        placeholder="Ex: Disparo Laser"
                                        style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }} />
                                </div>
                                <div>
                                    <label>ATIVA 2 (Gasta Mana):</label>
                                    <input type="text" maxLength={32} value={active2} onChange={e => setActive2(e.target.value)} required
                                        placeholder="Ex: Hackear Porta"
                                        style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#0f0', border: '1px solid #0f0', fontFamily: 'monospace' }} />
                                </div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', marginBottom: '1rem' }}>*Descrição das habilidades, equipamentos iniciais e demais infos serão geradas automaticamente.</p>
                    </>
                )
            case 4:
                return (
                    <div className="summary-view" style={{ border: '1px solid #0f0', padding: '1rem' }}>
                        <h3 style={{ borderBottom: '1px solid #0f0', paddingBottom: '0.5rem' }}>RESUMO DA FICHA</h3>
                        {avatarUrl && (
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                                <img src={avatarUrl} alt="Avatar Gerado" style={{ width: '128px', height: '128px', border: '2px solid #0f0', imageRendering: 'pixelated' }} />
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '1rem 0' }}>
                            <div>
                                <p><strong>NOME:</strong> {name}</p>
                                <p><strong>CAMPANHA:</strong> {campaigns.find(c => c.id === selectedCampaignId)?.title || 'Nenhuma'}</p>
                                <p><strong>FÍSICO:</strong> {physDesc}</p>
                                <p><strong>ORIGEM:</strong> {originDesc}</p>
                            </div>
                            <div>
                                <p><strong>ATRIBUTOS:</strong></p>
                                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                    <li>BRUTO {brute} | FLUIDO {fluid}</li>
                                    <li>INTELIGÊNCIA {int} | INSTINTO {inst}</li>
                                    <li>PRESENÇA {pres} | SUTILEZA {subt}</li>
                                </ul>
                            </div>
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <p><strong>HABILIDADES:</strong></p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                <div style={{ border: '1px solid #333', padding: '0.5rem' }}>
                                    <strong style={{ color: '#0f0' }}>PASSIVA: {passive}</strong>
                                    <div style={{ color: '#aaa', marginTop: '0.2rem' }}>Efeito: {skillDetails.passive.effect}</div>
                                </div>
                                <div style={{ border: '1px solid #333', padding: '0.5rem' }}>
                                    <strong style={{ color: '#0f0' }}>ATIVA 1: {active1}</strong>
                                    <div style={{ color: '#aaa', marginTop: '0.2rem' }}>Efeito: {skillDetails.active1.effect}</div>
                                    <div style={{ color: '#f0f', marginTop: '0.2rem' }}>Custo: {skillDetails.active1.cost}</div>
                                </div>
                                <div style={{ border: '1px solid #333', padding: '0.5rem' }}>
                                    <strong style={{ color: '#0f0' }}>ATIVA 2: {active2}</strong>
                                    <div style={{ color: '#aaa', marginTop: '0.2rem' }}>Efeito: {skillDetails.active2.effect}</div>
                                    <div style={{ color: '#f0f', marginTop: '0.2rem' }}>Custo: {skillDetails.active2.cost}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <p><strong>EQUIPAMENTO INICIAL:</strong></p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                <div style={{ border: '1px solid #333', padding: '0.5rem' }}>
                                    <strong style={{ color: '#0f0' }}>ARMA: {equipment.weapon.name}</strong>
                                    <div style={{ marginTop: '0.2rem' }}>Attr: {equipment.weapon.attribute}</div>
                                    {equipment.weapon.effect && <div style={{ color: '#aaa', marginTop: '0.2rem' }}>{equipment.weapon.effect}</div>}
                                </div>
                                <div style={{ border: '1px solid #333', padding: '0.5rem' }}>
                                    <strong style={{ color: '#0f0' }}>ARMADURA: {equipment.armor.name}</strong>
                                    <div style={{ marginTop: '0.2rem' }}>CA: {equipment.armor.ac}</div>
                                    {equipment.armor.effect && <div style={{ color: '#aaa', marginTop: '0.2rem' }}>{equipment.armor.effect}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
            backdropFilter: 'blur(5px)'
        }}>
            {generating && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.95)', zIndex: 10000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="step-led active" style={{ width: '20px', height: '20px', marginBottom: '1rem', boxShadow: '0 0 20px #0f0' }}></div>
                    <h2 style={{ color: '#0f0', fontFamily: 'Press Start 2P', textAlign: 'center', lineHeight: '1.5' }}>
                        GERANDO<br />PERSONAGEM...
                    </h2>
                    <p style={{ color: '#0f0', marginTop: '1rem', fontFamily: 'monospace' }}>Consultando a Matrix...</p>
                </div>
            )}

            <form onSubmit={handleNext} className="admin-form" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '800px',
                width: '100%',
                margin: '0 auto',
                position: 'relative', // Context for children
                minHeight: 0,
                maxHeight: '100%',
                overflow: 'hidden'
            }}>
                {renderStepTracker()}

                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#0f0', textShadow: '0 0 10px #0f0' }}>
                    {existingCharacter ? 'EDITAR PERSONAGEM' : 'NOVO PERSONAGEM'}
                </h3>

                <div className="wizard-scroll-content" style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '0.5rem',
                    border: '1px solid #333',
                    padding: '1rem',
                    background: 'rgba(0, 20, 0, 0.2)'
                }}>
                    {renderStepContent()}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                    <button type="button" onClick={step > 1 ? () => setStep(prev => prev - 1) : onCancel} className="admin-menu-btn" style={{ flex: 1, background: '#333' }}>
                        &lt; {step > 1 ? 'VOLTAR' : 'CANCELAR'}
                    </button>

                    {step < 4 ? (
                        <button type="submit" className="admin-menu-btn" style={{ flex: 1 }}>
                            PRÓXIMO &gt;
                        </button>
                    ) : (
                        <button type="button" onClick={handleConfirmSave} className="admin-menu-btn" style={{ flex: 1, backgroundColor: '#004400', borderColor: '#0f0' }}>
                            CONFIRMAR CRIAÇÃO
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
