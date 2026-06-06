const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

const p = new PrismaClient();

bcrypt.hash('admin123', 12).then(h =>
  p.usuario.update({
    where: { email: 'admin@tcdf.gov.br' },
    data: { senhaHash: h }
  }).then(() => {
    console.log('Senha redefinida com sucesso! Nova senha: admin123');
    p.$disconnect();
  })
).catch(e => {
  console.error(e);
  p.$disconnect();
});
