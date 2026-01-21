# SSH Key Generator

A free, open-source SSH key generator that runs entirely in your browser. Generate secure SSH keys with Ed25519 or RSA algorithms—your private keys never leave your device.

**Live Demo:** [https://sshkeygenerator.com](https://sshkeygenerator.com)

## Features

### Key Generation
- **Ed25519** (recommended) - Modern elliptic curve algorithm with excellent security
- **RSA** (2048/4096-bit) - Maximum compatibility with legacy systems
- **100% Client-Side** - All cryptographic operations happen in your browser
- **OpenSSH Format** - Standard output compatible with all SSH clients
- **SHA256 Fingerprints** - Verify key authenticity easily
- **Passphrase Encryption** - Optional password protection for private keys

### Command Mode
- Generate `ssh-keygen` commands for macOS, Linux, and Windows
- Copy-paste ready commands for terminal execution
- Complete setup scripts with proper permissions

### SSH Config Builder
- Visual builder for `~/.ssh/config` files
- Support for ProxyJump (bastion/jump hosts)
- Agent forwarding configuration
- Download ready-to-use config files

### Platform Guides
Step-by-step setup instructions for:
- GitHub
- GitLab
- Bitbucket
- AWS EC2
- Azure VMs
- DigitalOcean Droplets

### Progressive Web App
- **Works Offline** - Install as an app and generate keys without internet
- **Fast Loading** - Service worker caching for instant startup
- **Mobile Friendly** - Responsive design for all devices

### Internationalization
- English
- 简体中文 (Simplified Chinese)

## Tech Stack

- **React 19** - UI framework with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling
- **Tailwind CSS 4** - Utility-first styling
- **Zustand** - Lightweight state management
- **@noble/ed25519** - Audited Ed25519 implementation
- **Web Crypto API** - Browser-native cryptography for RSA

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/Fechin/ssh-key-generator.git
cd ssh-key-generator/keymint

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm preview  # Preview production build
pnpm lint     # Run ESLint
pnpm deploy   # Build and deploy to Cloudflare Pages
```

## Deployment

This project is configured for deployment to Cloudflare Pages:

```bash
pnpm deploy
```

The deploy script builds the project and deploys to the `ssh-key-generator` Cloudflare Pages project.

### Manual Deployment

1. Build the project: `pnpm build`
2. Deploy the `dist` folder to any static hosting service

## Security

### Client-Side Only

All key generation happens entirely in your browser using:
- **Web Crypto API** for RSA key generation
- **@noble/ed25519** for Ed25519 keys (audited cryptographic library)

### No Server Communication

- Private keys are never transmitted over the network
- No analytics or tracking of generated keys
- No server-side storage of any user data

### Open Source

The entire codebase is open source and auditable. We encourage security researchers to review our implementation.

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

Requires Web Crypto API support for RSA key generation.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [@noble/ed25519](https://github.com/paulmillr/noble-ed25519) - Audited Ed25519 implementation
- [shadcn/ui](https://ui.shadcn.com/) - UI component inspiration
- [Lucide Icons](https://lucide.dev/) - Beautiful open-source icons
