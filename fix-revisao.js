const fs = require('fs');
let c = fs.readFileSync('components/modules/wizard/step-revisao.tsx', 'utf8');

// 1. Adicionar useSession ao import
c = c.replace(
  '"use client";\nimport { useState } from "react";',
  '"use client";\nimport { useState } from "react";\nimport { useSession } from "next-auth/react";'
);

// 2. Adicionar hook useSession no componente
c = c.replace(
  '  const router = useRouter();\n  const [loading, setLoading] = useState(false);',
  '  const router = useRouter();\n  const { data: session } = useSession();\n  const isSusel = (session?.user as any)?.perfil !== "GRANDE_AREA";\n  const [loading, setLoading] = useState(false);'
);

// 3. Substituir botao de envio ao CIDE por mensagem condicional
c = c.replace(
  '          <div className="flex justify-between">\n            <Button variant="secondary" onClick={() => router.push(`/estagiarios/${estagiarioId}`)}>Ver cadastro</Button>\n            <Button onClick={handleEnviarCide} disabled={enviando}>\n              {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><CheckCircle className="w-4 h-4" /> Contratacao enviada ao Agente Integrador</>}\n            </Button>\n          </div>',
  '          {!isSusel ? (\n            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">\n              <div className="flex items-center gap-2 mb-1">\n                <CheckCircle className="w-5 h-5 text-blue-600" />\n                <span className="font-semibold text-blue-800">Solicitacao enviada para a SUSEL!</span>\n              </div>\n              <p className="text-sm text-blue-700">A equipe SUSEL foi notificada e ira dar continuidade ao processo de contratacao.</p>\n              <div className="mt-3">\n                <Button variant="secondary" onClick={() => router.push(`/estagiarios/${estagiarioId}`)}>Ver cadastro</Button>\n              </div>\n            </div>\n          ) : (\n            <div className="flex justify-between">\n              <Button variant="secondary" onClick={() => router.push(`/estagiarios/${estagiarioId}`)}>Ver cadastro</Button>\n              <Button onClick={handleEnviarCide} disabled={enviando}>\n                {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><CheckCircle className="w-4 h-4" /> Contratacao enviada ao Agente Integrador</>}\n              </Button>\n            </div>\n          )}'
);

fs.writeFileSync('components/modules/wizard/step-revisao.tsx', c);
console.log('OK3');