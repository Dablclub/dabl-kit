# Action Item

## Ideas ignite, actions transform reality.

Action Item is a note taker for all your conversations that converts your interactions into issues on Github. Build a project directory, make connections, and create bounties for your project without touching your keyboard.

---

## 🚀 Project Overview

You have so many great ideas, but you fail to take action to make them a reality. Whether it's your fear of failure, your lack of confidence, or being too busy, without a bias for action your ideas are forgotten and become opportunities for regret.

Action Item solves this by connecting to an open source voice-activated notetaker (Omi), transcribing your conversations into "memories" including overviews, action items, and events. All conversations are displayed in the Action Item App, and users can choose to:

- Send the memory to a contact
- Save the memory privately
- Burn the data after reading

## 🤖 Custom Agents

Memories provide the foundation layer for Custom Agents, where users can define specific Agent Profiles and Functionality to be invoked from memories and suggested actions.

Our Action Item app currently includes 3 custom agents:

- **Builder Agent**: Turns ideas into structured GitHub issues
- **Growth Agent**: Creates promotion content and growth strategies
- **Fundraiser Agent**: Prepares fundraising materials and investment outreach

This enables anyone to build, grow, and scale - from idea to MVP with minimal effort.

## 🏗️ Architecture

Action Item connects to the Real-Time Streaming API and Memories Webhook API provided by the open source Omi project. The Omi is a wearable necklace microphone that connects to your phone via Bluetooth using an open source mobile app.

The key components include:

1. Audio recording streamed live to Deepgram for transcription
2. Transcriptions stored in Pinecone vector database for RAG
3. Action Item server processing memories with consent controls
4. Project organization and action item generation
5. Integration with GitHub for issue creation
6. Farcaster integration for social sharing

## 🔧 Technology Stack

- **Frontend**: NextJS, TypeScript, React
- **Backend**: NodeJS, Express
- **Database**: PostgreSQL
- **AI**: OpenAI, Claude
- **Vector Database**: Pinecone
- **Transcription**: Deepgram
- **Hardware**: Omi wearable device
- **Integrations**: GitHub API, Farcaster

## ✨ Key Features

- **Voice-to-Action**: Capture conversations and transform them into structured action items
- **Project Organization**: Automatically organize discussions by project context
- **GitHub Integration**: Create issues, documentation, and development tickets
- **Memory Management**: Save, share, or delete conversation memories with full user control
- **Agentic Workflows**: Execute specialized workflows through purpose-built agents
- **Farcaster Social**: Share memories, promote projects, and create bounties
- **Privacy-First**: User controls all data with burn-after-reading option

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- Omi device or compatible audio input
- GitHub account
- API keys for: OpenAI/Claude, Deepgram, Pinecone

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/action-item.git
cd action-item

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the development server
npm run dev
```

### Configuration

1. Connect your Omi device using the [Omi mobile app](https://omiorg.com)
2. Link your GitHub account in the settings
3. Configure your preferred agent profiles

## 🔮 Future Improvements

- Edge computing for local processing (addressing Vitalik's feedback)
- Local LLM support for enhanced privacy
- Integration with decentralized infrastructure (Akash)
- Additional project management tool integrations
- Expanded agent capabilities
- Community contribution framework

## 🧪 Hackathon Development Notes

Action Item was developed during ETHDenver 2025. We started with a concept of a hacker starter kit and evolved it into a full-fledged productivity tool for builders.

Our development decisions:

- Using cloud services for rapid development
- Focused on core workflow from conversation to GitHub
- Prioritized user control and consent features
- Leveraged open-source Omi platform for audio capture

## 👥 Team

- [Team Member 1] - Role/Expertise
- [Team Member 2] - Role/Expertise
- [Team Member 3] - Role/Expertise
- [Team Member 4] - Role/Expertise

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The Omi open-source community
- ETHDenver 2025 organizers and mentors
- Our early testers who provided valuable feedback

---
