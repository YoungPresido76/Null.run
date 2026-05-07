#!/bin/bash

# Neon Verse Project Structure Generator
# Run this script to create the entire project structure in one go

echo "🚀 Creating Neon Verse project structure..."

# Create directory structure
mkdir -p public/assets/music
mkdir -p src/components/ui
mkdir -p src/components/game/layout
mkdir -p src/components/game/orb
mkdir -p src/components/game/producers
mkdir -p src/components/game/leaderboard
mkdir -p src/components/game/social
mkdir -p src/components/game/market
mkdir -p src/components/game/staking
mkdir -p src/components/game/hq
mkdir -p src/components/game/achievements
mkdir -p src/components/game/modals
mkdir -p src/context
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types

# Create UI components
touch src/components/ui/button.tsx
touch src/components/ui/card.tsx
touch src/components/ui/dialog.tsx

# Create game layout components
touch src/components/game/layout/GameLayout.tsx
touch src/components/game/layout/GameHeader.tsx
touch src/components/game/layout/TabNav.tsx

# Create orb components
touch src/components/game/orb/ChillOrb.tsx
touch src/components/game/orb/OrbParticles.tsx

# Create producers components
touch src/components/game/producers/ProducerPanel.tsx
touch src/components/game/producers/ProducerCard.tsx

# Create leaderboard components
touch src/components/game/leaderboard/Leaderboard.tsx

# Create social components
touch src/components/game/social/Friends.tsx
touch src/components/game/social/Gifting.tsx
touch src/components/game/social/Raids.tsx

# Create market components
touch src/components/game/market/NFTCollection.tsx
touch src/components/game/market/NFTMarketplace.tsx
touch src/components/game/market/ArtefactsVault.tsx

# Create staking components
touch src/components/game/staking/StakePanel.tsx
touch src/components/game/staking/DiamondStake.tsx
touch src/components/game/staking/CommunityPot.tsx

# Create HQ components
touch src/components/game/hq/HQPanel.tsx
touch src/components/game/hq/HQRoom.tsx

# Create achievements components
touch src/components/game/achievements/Achievements.tsx

# Create modal components
touch src/components/game/modals/EditNameModal.tsx
touch src/components/game/modals/OfflineProgressModal.tsx
touch src/components/game/modals/GiftModal.tsx

# Create context
touch src/context/GameContext.tsx

# Create hooks
touch src/hooks/useGameState.ts
touch src/hooks/useGameLoop.ts
touch src/hooks/useFirebase.ts
touch src/hooks/useLeaderboard.ts
touch src/hooks/useSaveLoad.ts

# Create lib files
touch src/lib/firebase.ts
touch src/lib/gameLogic.ts
touch src/lib/constants.ts
touch src/lib/utils.ts

# Create types
touch src/types/game.ts
touch src/types/firebase.ts

# Create root files
touch src/main.tsx
touch src/App.tsx
touch src/index.css
touch src/App.css
touch index.html

# Create config files
touch package.json
touch tsconfig.json
touch vite.config.ts
touch tailwind.config.js
touch .env
touch .env.example
touch .gitignore

echo "✅ Directory structure created!"
echo ""
echo "📁 Created:"
echo "   - 3 UI components"
echo "   - 20 game-specific components"
echo "   - 5 custom hooks"
echo "   - 4 library files"
echo "   - 2 type definition files"
echo "   - 6 configuration files"
echo ""
echo "🎉 Project structure ready! Now run: npm install"
