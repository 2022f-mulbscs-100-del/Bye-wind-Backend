const { prisma } = require('./src/config');

async function checkStatus() {
  try {
    const status = await prisma.branchGoLiveStatus.findMany();
    console.log('BranchGoLiveStatus:', JSON.stringify(status, null, 2));
    
    const checklist = await prisma.goLiveChecklist.findMany();
    console.log('GoLiveChecklist:', JSON.stringify(checklist, null, 2));

    const floorPlans = await prisma.floorPlan.findMany({
        where: { isActive: true },
        include: { tables: { where: { isActive: true } } }
    });
    console.log('FloorPlans with tables count:', floorPlans.map(fp => ({ id: fp.id, branchId: fp.branchId, tables: fp.tables.length })));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
