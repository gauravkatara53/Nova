import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

async function processLineByLine() {
  const filePath = path.join(process.cwd(), 'datasheet.csv');
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  const headers = [];
  
  let count = 0;
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      // headers: id,name,companyId,email,company,linkedin,phone,role,notes,tags,userId,status,relationshipStrength
      continue;
    }

    const columns = line.split(',');
    
    // basic handling if line doesn't have enough columns
    if (columns.length < 11) continue;

    const id = columns[0];
    const name = columns[1];
    const companyId = columns[2] || null;
    const email = columns[3] || null;
    const companyName = columns[4];
    const linkedin = columns[5] || null;
    const phone = columns[6] || null;
    const role = columns[7] || null;
    const notes = columns[8] || null;
    const tags = columns[9] ? columns[9].split(';') : [];
    const userId = columns[10];
    
    if (!userId) continue;

    // Check if company exists if we have a companyName
    let resolvedCompanyId = null;
    if (companyName) {
      let company = await prisma.company.findFirst({
        where: { name: companyName, userId: userId }
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: companyName,
            userId: userId,
          }
        });
      }
      resolvedCompanyId = company.id;
    }

    // Upsert or create contact
    // Check if contact with same email exists for this user, or we can just use the provided ID if we want,
    // but the ID in CSV might conflict if not cuid. Let's let Prisma generate it. 
    // Actually, maybe we can use the email to check uniqueness per user.
    if (email) {
      const existing = await prisma.contact.findFirst({
        where: { email: email, userId: userId }
      });
      if (!existing) {
        await prisma.contact.create({
          data: {
            name: name,
            email: email,
            linkedin: linkedin,
            phone: phone,
            role: role,
            notes: notes,
            userId: userId,
            companyId: resolvedCompanyId,
          }
        });
        count++;
      } else {
        // We can update or skip. Let's just skip for now.
      }
    } else {
       await prisma.contact.create({
          data: {
            name: name,
            linkedin: linkedin,
            phone: phone,
            role: role,
            notes: notes,
            userId: userId,
            companyId: resolvedCompanyId,
          }
        });
        count++;
    }

    if (count % 10 === 0) {
      console.log(`Imported ${count} contacts...`);
    }
  }
  
  console.log(`Successfully imported ${count} contacts.`);
}

processLineByLine()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
