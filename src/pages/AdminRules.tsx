
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'
import './AdminRules.css'

export function AdminRules() {
    const navigate = useNavigate()
    const [brute, setBrute] = useState(4)
    const fluid = 8 - brute

    const renderDemoSlider = () => (
        <div className="attribute-slider-container" style={{ marginTop: '1rem', border: '1px solid #333' }}>
            <small style={{ color: '#0f0', display: 'block', marginBottom: '0.5rem', textAlign: 'center' }}>TESTE O EQUILÍBRIO (Total 8)</small>
            <div className="slider-labels">
                <span>BRUTO ({brute})</span>
                <span>({fluid}) FLUIDO</span>
            </div>
            <input type="range" min="1" max="7" value={brute} onChange={e => setBrute(Number(e.target.value))} />
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>
                {brute > fluid ? 'Você é forte, mas lento.' : (fluid > brute ? 'Você é rápido, mas frágil.' : 'Perfeitamente equilibrado.')}
            </p>
        </div>
    )

    return (
        <div className="admin-container">
            <button className="nav-button" onClick={() => navigate('/admin')}>
                &lt; VOLTAR
            </button>
            <h1 className="admin-title">GERENCIAR REGRAS</h1>

            <div className="admin-content rules-content">
                <h2 className="rules-header">GUIA DO JOGADOR: SISTEMA BINÁRIO</h2>
                <p>Bem-vindo ao Project Binary, um RPG que tudo (ou quase tudo) por aqui funciona na base do SIM ou NÃO (1 ou 0).</p>
                <p>Aqui está tudo o que você precisa saber para começar a jogar.</p>

                <section className="rule-section">
                    <h3>1. A Regra de Ouro: Como Jogar os Dados</h3>
                    <p>Neste jogo, usamos apenas o <strong>Dado de 8 faces (d8)</strong>. Sempre que você precisar fazer qualquer teste (atacar, pular um buraco, mentir), o sistema simulará seus dados.</p>
                    <p>O que importa não é o valor total, mas sim quantos <strong>números PARES</strong> você tira.</p>
                    <ul>
                        <li><strong>NÚMEROS PARES (2, 4, 6, 8):</strong> Valem 1 Sucesso.</li>
                        <li><strong>NÚMEROS ÍMPARES (1, 3, 5, 7):</strong> Valem 0 (Falha).</li>
                    </ul>
                    <p><strong>O Overclock (O "8")</strong></p>
                    <p>Se o dado cair no número 8, ele conta como 1 sucesso e você ganha o direito de <strong>rolar esse dado novamente</strong>. Se der par de novo, soma mais 1 sucesso. Você continua rolando enquanto tirar 8!</p>
                    <div className="example-box">
                        <p><strong>Exemplo Prático:</strong></p>
                        <p>Você joga 3 dados para arrombar uma porta. Os resultados são: 3, 4, 8.</p>
                        <ul>
                            <li>3: Ímpar (0 sucesso).</li>
                            <li>4: Par (1 sucesso).</li>
                            <li>8: Par e Overclock! (1 sucesso + rolar de novo).</li>
                            <li>Nova rolagem do 8: Caiu 2 (1 sucesso).</li>
                        </ul>
                        <p><strong>Total: 3 Sucessos!</strong></p>
                    </div>
                </section>

                <section className="rule-section">
                    <h3>2. Quem é Seu Personagem (Atributos)</h3>
                    <p>Você não é bom em tudo. Seus atributos funcionam como uma balança. Você tem 3 Eixos, e cada eixo tem 8 pontos totais distribuídos entre dois lados opostos. Se um lado é alto, o outro é baixo.</p>

                    <div className="attribute-group">
                        <ul>
                            <li><strong>BRUTO:</strong> Use para força bruta, resistir a venenos ou carregar peso.</li>
                            <li><strong>FLUIDO:</strong> Use para agilidade, correr, acrobacias e pontaria.</li>
                        </ul>
                    </div>

                    <div className="attribute-group">
                        <ul>
                            <li><strong>INTELIGÊNCIA:</strong> Use para lógica, operar máquinas e conhecimento.</li>
                            <li><strong>INSTINTO:</strong> Use para perceber perigos, reflexos e intuição.</li>
                        </ul>
                    </div>

                    <div className="attribute-group">
                        <ul>
                            <li><strong>PRESENÇA:</strong> Use para liderar, intimidar e impor sua vontade.</li>
                            <li><strong>SUTILEZA:</strong> Use para enganar, ser furtivo e passar despercebido.</li>
                        </ul>
                    </div>

                    <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>Na sua ficha: Se você tem BRUTO (6), obrigatoriamente terá FLUIDO (2).</p>
                    {renderDemoSlider()}
                </section>

                <section className="rule-section">
                    <h3>3. Combate: A Hora da Ação</h3>
                    <p>As lutas são rápidas. Veja como funciona um turno:</p>
                    <ol>
                        <li><strong>Quem age primeiro?</strong> Todos rolam o atributo FLUIDO. Quem tiver mais sucessos começa.</li>
                        <li><strong>O Ataque:</strong> Você escolhe sua arma e rola os dados do atributo dela (Ex: Machado usa Bruto, Arco usa Fluido). Conte seus Sucessos.</li>
                        <li><strong>A Defesa:</strong> O inimigo tenta se defender rolando o atributo dele (Bruto para bloquear ou Fluido para esquivar). Ele conta os Sucessos dele.</li>
                    </ol>
                    <p className="formula">Sucessos do Ataque - Sucessos da Defesa = DANO</p>
                </section>

                <section className="rule-section">
                    <h3>4. Vida e Mana: Seus Recursos</h3>
                    <p>Aqui não anotamos números quebrados, usamos marcações visuais.</p>

                    <div className="resource-item">
                        <p><strong>[♥] VIDA (Corações)</strong>: Representa sua saúde.</p>
                        <p>Cada ponto de dano que você sofre apaga 1 Coração [♥] -&gt; [♡]. Se o último coração apagar, seu personagem morre.</p>
                    </div>

                    <div className="resource-item">
                        <p><strong>[■] MANA (Bits)</strong>: Representa sua energia para usar poderes especiais.</p>
                        <p>Representada por quadradinhos [■]. Usar uma habilidade "Ativa" apaga os quadradinhos necessários [■] -&gt; [ ]. Você recupera Mana descansando ou usando itens.</p>
                    </div>
                </section>

                <section className="rule-section">
                    <h3>5. Habilidades Especiais</h3>
                    <p>Seu personagem tem um limite de memória. Você só pode ter 3 Habilidades na sua ficha:</p>
                    <ul>
                        <li><strong>1 HABILIDADE PASSIVA (Fixa):</strong> Um poder que está sempre ligado e não gasta Mana. Você escolhe ao criar o personagem e nunca muda.</li>
                        <li><strong>2 HABILIDADES ATIVAS (Trocáveis):</strong> Poderes fortes que gastam Mana (Bits) para usar.</li>
                    </ul>
                    <div className="warning-box">
                        <p>[!] <strong>Regra de Substituição:</strong></p>
                        <p>Você pode encontrar novas habilidades durante a aventura. Se quiser aprender uma 3ª habilidade ativa, você é obrigado a esquecer uma das duas que já tem.</p>
                    </div>
                </section>

                <section className="rule-section">
                    <h3>6. Evolução</h3>
                    <p>Como ficar mais forte?</p>
                    <p>Sua ficha tem uma Barra de XP com 8 espaços vazios: [ ][ ][ ][ ][ ][ ][ ][ ].</p>
                    <p>O Mestre te dará XP ao fim das missões. O próprio Mestre será responsável por marcar um [X] para cada ponto. Quando completar os 8 espaços, você sobe de Nível e a barra limpa.</p>
                    <p><strong>Prêmio de Nível:</strong> Você escolhe APENAS UM benefício:</p>
                    <ul>
                        <li>Ganhar +1 Coração [♥] (Mais Vida).</li>
                        <li><strong>OU</strong></li>
                        <li>Ganhar +1 Bit [■] (Mais Mana).</li>
                    </ul>
                </section>
            </div>
        </div>
    )
}
