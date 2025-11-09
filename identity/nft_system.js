// NFT Identity Economy System
// Self-sovereign identity creation and community-validated worth

class NFTSystem {
    constructor() {
        this.nftFactory = {
            templates: {
                hex_sigil: {
                    costDust: 50,
                    description: "Geometric identity signature",
                    attributes: ["shape", "color", "pattern", "energy_type"],
                    steps: [
                        "🎨 Choose base shape (triangle, hexagon, circle):",
                        "🌈 Select primary color energy:",
                        "⚡ Pick pattern type (chaotic, ordered, flowing):",
                        "💫 Set energy signature (creative, logical, emotional):"
                    ]
                },
                '3d_avatar': {
                    costDust: 200,
                    description: "3D animated identity vessel",
                    attributes: ["model", "animation", "materials", "aura"],
                    steps: [
                        "👤 Choose body form (humanoid, abstract, elemental):",
                        "🎭 Select animation style (fluid, robotic, organic):",
                        "✨ Pick material type (crystal, light, data, void):",
                        "🌌 Set aura effect (glowing, shifting, pulsing):"
                    ]
                },
                reality_shard: {
                    costDust: 500,
                    description: "Fragment of perceived reality",
                    attributes: ["dimension", "stability", "resonance", "memory"],
                    steps: [
                        "🌀 Choose dimension type (temporal, spatial, mental):",
                        "⚖️ Set stability level (chaotic, balanced, rigid):",
                        "📡 Pick resonance frequency (low, harmonic, high):",
                        "🧠 Define memory essence (past, present, future):"
                    ]
                }
            }
        };
        
        this.userNFTs = {}; // userId -> [NFT objects]
        this.marketplace = {}; // nftId -> listing data
        this.pendingCreations = {}; // userId -> creation in progress
        this.nftCounter = 0;
    }
    
    /**
     * Generate unique NFT ID
     */
    generateNFTId(ownerId) {
        this.nftCounter++;
        const hash = (Date.now() + ownerId + this.nftCounter).toString(36);
        return `NFT-${hash.slice(-8).toUpperCase()}`;
    }
    
    /**
     * Calculate rarity score based on metadata uniqueness
     */
    calculateRarity(metadata, templateType) {
        let baseRarity = 1;
        
        // More detailed metadata = higher rarity
        const metadataLength = JSON.stringify(metadata).length;
        const uniquenessBonus = Math.min(metadataLength / 500, 5);
        
        // Template-specific bonuses
        const templateMultipliers = {
            hex_sigil: 1.0,
            '3d_avatar': 1.5,
            reality_shard: 2.0
        };
        
        const templateBonus = templateMultipliers[templateType] || 1.0;
        
        const rarity = (baseRarity + uniquenessBonus) * templateBonus;
        return Math.min(rarity, 10.0);
    }
    
    /**
     * Start NFT creation process
     */
    startCreation(userId, templateType) {
        const template = this.nftFactory.templates[templateType];
        if (!template) {
            return { success: false, error: 'Template not found' };
        }
        
        this.pendingCreations[userId] = {
            templateType: templateType,
            template: template,
            metadata: {},
            currentStep: 0,
            startedAt: Date.now()
        };
        
        return {
            success: true,
            cost: template.costDust,
            currentStep: 0,
            prompt: template.steps[0],
            totalSteps: template.steps.length
        };
    }
    
    /**
     * Process user response for current creation step
     */
    processCreationStep(userId, response) {
        const creation = this.pendingCreations[userId];
        if (!creation) {
            return { success: false, error: 'No creation in progress' };
        }
        
        // Store response
        creation.metadata[`step_${creation.currentStep + 1}`] = response;
        creation.currentStep++;
        
        // Check if creation is complete
        if (creation.currentStep >= creation.template.steps.length) {
            return this.finalizeCreation(userId);
        }
        
        // Return next step
        return {
            success: true,
            complete: false,
            currentStep: creation.currentStep,
            prompt: creation.template.steps[creation.currentStep],
            totalSteps: creation.template.steps.length
        };
    }
    
    /**
     * Finalize NFT creation
     */
    finalizeCreation(userId) {
        const creation = this.pendingCreations[userId];
        if (!creation) {
            return { success: false, error: 'No creation in progress' };
        }
        
        // Create NFT object
        const nft = {
            id: this.generateNFTId(userId),
            ownerId: userId,
            template: creation.templateType,
            metadata: creation.metadata,
            createdAt: Date.now(),
            communityWorth: 0,
            rarityScore: this.calculateRarity(creation.metadata, creation.templateType),
            transactionHistory: [],
            appreciationCount: 0
        };
        
        // Add to user's collection
        if (!this.userNFTs[userId]) {
            this.userNFTs[userId] = [];
        }
        this.userNFTs[userId].push(nft);
        
        // Clear pending creation
        delete this.pendingCreations[userId];
        
        return {
            success: true,
            complete: true,
            nft: nft
        };
    }
    
    /**
     * Cancel ongoing creation
     */
    cancelCreation(userId) {
        if (this.pendingCreations[userId]) {
            delete this.pendingCreations[userId];
            return { success: true };
        }
        return { success: false, error: 'No creation in progress' };
    }
    
    /**
     * Get user's NFT collection
     */
    getUserNFTs(userId) {
        return this.userNFTs[userId] || [];
    }
    
    /**
     * Find NFT by ID
     */
    findNFT(nftId) {
        for (const userId in this.userNFTs) {
            const nft = this.userNFTs[userId].find(n => n.id === nftId);
            if (nft) {
                return { nft, ownerId: userId };
            }
        }
        return null;
    }
    
    /**
     * Generate visual preview of NFT based on metadata
     */
    generatePreview(nft) {
        const metadata = nft.metadata;
        const template = nft.template;
        
        if (template === 'hex_sigil') {
            const shape = metadata.step_1 || 'mystery';
            const color = metadata.step_2 || 'prismatic';
            const pattern = metadata.step_3 || 'unique';
            const energy = metadata.step_4 || 'potential';
            return `**${color} ${shape}** with ${pattern} patterns\nEnergy: ${energy}`;
        } else if (template === '3d_avatar') {
            const form = metadata.step_1 || 'being';
            const animation = metadata.step_2 || 'living';
            const material = metadata.step_3 || 'essence';
            const aura = metadata.step_4 || 'presence';
            return `**${material} ${form}** with ${animation} movement\nAura: ${aura}`;
        } else if (template === 'reality_shard') {
            const dimension = metadata.step_1 || 'unknown';
            const stability = metadata.step_2 || 'shifting';
            const resonance = metadata.step_3 || 'silent';
            const memory = metadata.step_4 || 'forgotten';
            return `**${dimension} dimension** with ${stability} stability\nResonance: ${resonance} | Memory: ${memory}`;
        }
        
        return "Unique digital artifact";
    }
    
    /**
     * Appreciate an NFT (add community worth)
     */
    appreciate(nftId, appreciatorId, amount) {
        const result = this.findNFT(nftId);
        if (!result) {
            return { success: false, error: 'NFT not found' };
        }
        
        const { nft, ownerId } = result;
        
        if (appreciatorId === ownerId) {
            return { success: false, error: 'Cannot appreciate your own NFT' };
        }
        
        // Add to community worth
        nft.communityWorth += amount;
        nft.appreciationCount++;
        
        // Record transaction
        nft.transactionHistory.push({
            type: 'appreciation',
            from: appreciatorId,
            amount: amount,
            timestamp: Date.now()
        });
        
        return {
            success: true,
            newWorth: nft.communityWorth,
            totalAppreciations: nft.appreciationCount,
            ownerId: ownerId
        };
    }
    
    /**
     * List NFT for sale
     */
    listForSale(nftId, sellerId, price) {
        const result = this.findNFT(nftId);
        if (!result) {
            return { success: false, error: 'NFT not found' };
        }
        
        const { nft, ownerId } = result;
        
        if (sellerId !== ownerId) {
            return { success: false, error: 'You do not own this NFT' };
        }
        
        if (this.marketplace[nftId]) {
            return { success: false, error: 'NFT already listed' };
        }
        
        this.marketplace[nftId] = {
            nft: nft,
            sellerId: sellerId,
            price: price,
            listedAt: Date.now()
        };
        
        return { success: true, listing: this.marketplace[nftId] };
    }
    
    /**
     * Buy NFT from marketplace
     */
    buyNFT(nftId, buyerId) {
        const listing = this.marketplace[nftId];
        if (!listing) {
            return { success: false, error: 'NFT not listed for sale' };
        }
        
        if (buyerId === listing.sellerId) {
            return { success: false, error: 'Cannot buy your own NFT' };
        }
        
        const { nft, sellerId, price } = listing;
        
        // Transfer ownership
        const sellerNFTs = this.userNFTs[sellerId];
        const nftIndex = sellerNFTs.findIndex(n => n.id === nftId);
        
        if (nftIndex === -1) {
            return { success: false, error: 'NFT ownership inconsistency' };
        }
        
        // Remove from seller
        sellerNFTs.splice(nftIndex, 1);
        
        // Add to buyer
        if (!this.userNFTs[buyerId]) {
            this.userNFTs[buyerId] = [];
        }
        nft.ownerId = buyerId;
        this.userNFTs[buyerId].push(nft);
        
        // Record transaction
        nft.transactionHistory.push({
            type: 'sale',
            from: sellerId,
            to: buyerId,
            price: price,
            timestamp: Date.now()
        });
        
        // Remove from marketplace
        delete this.marketplace[nftId];
        
        return {
            success: true,
            nft: nft,
            sellerId: sellerId,
            price: price
        };
    }
    
    /**
     * Unlist NFT from marketplace
     */
    unlistNFT(nftId, userId) {
        const listing = this.marketplace[nftId];
        if (!listing) {
            return { success: false, error: 'NFT not listed' };
        }
        
        if (listing.sellerId !== userId) {
            return { success: false, error: 'Not your listing' };
        }
        
        delete this.marketplace[nftId];
        return { success: true };
    }
    
    /**
     * Get marketplace listings
     */
    getMarketplace() {
        return Object.values(this.marketplace);
    }
    
    /**
     * Get NFT economy statistics
     */
    getEconomyStats() {
        const totalNFTs = Object.values(this.userNFTs).reduce((sum, nfts) => sum + nfts.length, 0);
        const allNFTs = Object.values(this.userNFTs).flat();
        const totalWorth = allNFTs.reduce((sum, nft) => sum + nft.communityWorth, 0);
        const totalAppreciations = allNFTs.reduce((sum, nft) => sum + nft.appreciationCount, 0);
        
        let mostValuable = null;
        if (allNFTs.length > 0) {
            mostValuable = allNFTs.reduce((max, nft) => 
                nft.communityWorth > (max?.communityWorth || 0) ? nft : max
            , null);
        }
        
        return {
            totalNFTs: totalNFTs,
            totalCreators: Object.keys(this.userNFTs).length,
            totalWorth: totalWorth,
            totalAppreciations: totalAppreciations,
            marketplaceListings: Object.keys(this.marketplace).length,
            mostValuable: mostValuable,
            averageWorth: totalNFTs > 0 ? Math.round(totalWorth / totalNFTs) : 0
        };
    }
    
    /**
     * Get all templates
     */
    getTemplates() {
        return this.nftFactory.templates;
    }
}

module.exports = NFTSystem;
