const fs = require('fs');
const content = fs.readFileSync('src/routes/tripRoutes.ts', 'utf8');

let newContent = content.replace(
  "res.status(201).json(stop);",
  `        // Badges logic
        let new_badges = [];
        const badge = await prisma.badge.findUnique({ where: { city_id: city.id } });
        
        if (badge) {
          const userBadgeExists = await prisma.userBadge.findUnique({
            where: {
              user_id_badge_id: {
                user_id: req.user!.userId,
                badge_id: badge.id
              }
            }
          });
          
          if (!userBadgeExists) {
            const newBadge = await prisma.userBadge.create({
              data: {
                user_id: req.user!.userId,
                badge_id: badge.id,
                trip_id: tripId
              },
              include: { badge: true }
            });
            new_badges.push(newBadge.badge);
          }
        }
        
        res.status(201).json({ stop, new_badges });`
);

const newRoutes = `

// --- Split & Participant Endpoints ---

router.post('/:id/participants', authenticate, async (req, res, next) => {
  try {
    const { name, email, user_id } = req.body;
    const participant = await prisma.tripParticipant.create({
      data: {
        trip_id: req.params.id,
        name,
        email,
        user_id
      }
    });
    res.status(201).json(participant);
  } catch(e) { next(e); }
});

router.delete('/:id/participants/:participantId', authenticate, async (req, res, next) => {
  try {
    await prisma.tripParticipant.delete({
      where: { id: req.params.participantId }
    });
    res.json({ message: 'Participant removed' });
  } catch(e) { next(e); }
});

router.put('/:id/split', authenticate, async (req, res, next) => {
  try {
    const { split_type, shares } = req.body; // shares: [{ participant_id, share_percentage }]
    
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: { split_type }
    });
    
    if (split_type === 'CUSTOM' && shares) {
      // Validate sum is ~100
      const sum = shares.reduce((acc, s) => acc + s.share_percentage, 0);
      if (Math.abs(sum - 100) > 0.1) {
        return res.status(400).json({ error: 'Share percentages must sum to 100' });
      }
      
      for (const share of shares) {
        const existing = await prisma.splitShare.findFirst({
          where: { trip_id: trip.id, participant_id: share.participant_id }
        });
        
        if (existing) {
          await prisma.splitShare.update({
            where: { id: existing.id },
            data: { share_percentage: share.share_percentage }
          });
        } else {
          await prisma.splitShare.create({
            data: {
              trip_id: trip.id,
              participant_id: share.participant_id,
              share_percentage: share.share_percentage
            }
          });
        }
      }
    }
    
    res.json(trip);
  } catch(e) { next(e); }
});

router.put('/:id/participants/:participantId/paid', authenticate, async (req, res, next) => {
  try {
    const { amount_paid } = req.body;
    
    const existing = await prisma.splitShare.findFirst({
      where: { trip_id: req.params.id, participant_id: req.params.participantId }
    });
    
    if (existing) {
      await prisma.splitShare.update({
        where: { id: existing.id },
        data: { amount_paid }
      });
    } else {
      await prisma.splitShare.create({
        data: {
          trip_id: req.params.id,
          participant_id: req.params.participantId,
          amount_paid
        }
      });
    }
    res.json({ message: 'Amount paid updated' });
  } catch(e) { next(e); }
});

router.get('/:id/split-summary', authenticate, async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        budget_items: true,
        participants: true,
        shares: true
      }
    });
    
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    
    const totalBudget = trip.budget_items.reduce((sum, item) => sum + item.amount, 0);
    const numParticipants = trip.participants.length;
    
    if (numParticipants === 0 || trip.split_type === 'NONE') {
       return res.json({ totalBudget, participants: [], settlements: [], split_type: trip.split_type });
    }
    
    const participantSummaries = trip.participants.map(p => {
       const share = trip.shares.find(s => s.participant_id === p.id);
       const amountPaid = share ? share.amount_paid : 0;
       
       let shareAmount = 0;
       if (trip.split_type === 'EQUAL') {
          shareAmount = totalBudget / numParticipants;
       } else if (trip.split_type === 'CUSTOM') {
          const pct = share ? share.share_percentage : 0;
          shareAmount = (pct / 100) * totalBudget;
       }
       
       const balance = amountPaid - shareAmount; // Positive means they overpaid (owed), negative means they owe
       
       return {
          participant_id: p.id,
          name: p.name,
          shareAmount,
          amountPaid,
          balance
       };
    });
    
    // Greedy settlement algorithm
    const debtors = participantSummaries.filter(p => p.balance < -0.01).map(p => ({ ...p, balance: Math.abs(p.balance) })).sort((a,b) => b.balance - a.balance);
    const creditors = participantSummaries.filter(p => p.balance > 0.01).sort((a,b) => b.balance - a.balance);
    
    const settlements = [];
    let i = 0, j = 0;
    
    while (i < debtors.length && j < creditors.length) {
       const debtor = debtors[i];
       const creditor = creditors[j];
       
       const amount = Math.min(debtor.balance, creditor.balance);
       if (amount > 0.01) {
           settlements.push({
             from: debtor.name,
             to: creditor.name,
             amount
           });
       }
       
       debtor.balance -= amount;
       creditor.balance -= amount;
       
       if (debtor.balance <= 0.01) i++;
       if (creditor.balance <= 0.01) j++;
    }
    
    res.json({
       totalBudget,
       split_type: trip.split_type,
       participants: participantSummaries,
       settlements
    });
  } catch(e) { next(e); }
});

export default router;
`;

newContent = newContent.replace("export default router;", newRoutes);

fs.writeFileSync('src/routes/tripRoutes.ts', newContent);
