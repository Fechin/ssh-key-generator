# What Is an SSH Key — article illustrations

Created with the built-in image_gen tool on 2026-10-03. The three final assets are shared by all 30 article translations; captions and alternative text are localized in each MDX file. Original output dimensions are 1536 × 1024. WebP encoding preserves those dimensions.

## Editorial intent and placement

1. **Public/private key responsibilities** — after the introductory paragraph in “Public Key vs. Private Key,” before its first subsection. Show the private key staying on the laptop and only public key copies reaching a server and code host.
2. **GitHub setup workflow** — after the introduction to “How to Add an SSH Key to GitHub,” before Step 1. Show copying the .pub file, adding it to GitHub and testing SSH authentication. The browser window is a conceptual illustration, not a screenshot; the key string is abbreviated example text.
3. **Passphrase and ssh-agent** — after the introduction to “SSH Key Passphrases,” before its first subsection. Distinguish an encrypted private key file on disk from the decrypted key held by ssh-agent in local memory.

## Final assets

- `/public/images/articles/what-is-an-ssh-key/public-private-keys.webp`
- `/public/images/articles/what-is-an-ssh-key/github-public-key-setup.webp`
- `/public/images/articles/what-is-an-ssh-key/passphrase-ssh-agent.webp`

## Accuracy references

- [GitHub: adding a new SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
- [OpenSSH: ssh-agent manual](https://man.openbsd.org/ssh-agent)

## Generation prompts

### public-private-keys

```text
Use case: scientific-educational. Asset type: original in-article editorial illustration for a beginner's guide titled What Is an SSH Key. Style: premium restrained editorial illustration, slightly isometric tactile paper-and-matte-ceramic forms, precise charcoal linework, subtle fine paper texture and soft realistic ambient shadows. Warm ivory background #FAF9F6, charcoal #3D3B35, muted terracotta #C56B4C and sage green #7E9681, matching a calm developer website. Landscape 3:2 canvas, ideally 1536x1024, generous 8 percent outer margin. Large easily understood objects, generous breathing room; short technical labels in exceptionally legible dark monospace. No title, no paragraphs, no tiny decorative code, no holograms, no neon, no photo, no watermark. All important elements must be legible when displayed 700px wide. This is an educational metaphor, not an application screenshot.
Primary request: Explain the distinct roles of an SSH public key and private key. The composition is a broad laptop on the left with a subtle rounded boundary representing the local device; inside that boundary, show a terracotta key file labelled exactly "id_ed25519" with a closed padlock and small key motif. This private file stays entirely inside the laptop. Above its local folder sits a sage public key file labelled exactly "id_ed25519.pub". Two gently branching directional lines carry only copies of this sage .pub file to a server tower and a code-repository window on the right; each destination visibly holds the same sage public file. The private key has no outgoing connection, never shown travelling. Files are the primary objects; laptop, server, repo icons provide context. The same filename repeated should be crisp and accurate. Text (verbatim), only "id_ed25519" and "id_ed25519.pub"; no other text. Technical constraint: servers and code hosts receive only the public key; the private key stays local. Do not depict sending the private key or a password, do not imply the public key alone grants access.
```

### github-public-key-setup

```text
Use case: scientific-educational. Asset type: original in-article editorial illustration for a beginner's guide titled What Is an SSH Key. Style: premium restrained editorial illustration, slightly isometric tactile paper-and-matte-ceramic forms, precise charcoal linework, subtle fine paper texture and soft realistic ambient shadows. Warm ivory background #FAF9F6, charcoal #3D3B35, muted terracotta #C56B4C and sage green #7E9681, matching a calm developer website. Landscape 3:2 canvas, ideally 1536x1024, generous 8 percent outer margin. Large easily understood objects, generous breathing room; short technical labels in exceptionally legible dark monospace. No title, no paragraphs, no tiny decorative code, no holograms, no neon, no photo, no watermark. All important elements must be legible when displayed 700px wide. This is an educational metaphor, not an application screenshot.
Primary request: A clear three-part practical visual explaining adding an SSH PUBLIC key to GitHub and testing the connection, with a different composition from a key-ownership illustration. Three generous evenly spaced objects with thin terracotta directional arrows between them: left a large sage document on a clipboard labelled exactly "id_ed25519.pub" with a copy symbol; middle a stylized calm browser window whose header reads exactly "GitHub", inside it the short section label exactly "SSH and GPG keys", a small button exactly "New SSH key", and a key textarea containing exactly "ssh-ed25519 AAAA...". Right a dark-charcoal terminal tile showing exactly "ssh -T" on first line and "git@github.com" on second line, with a single large sage checkmark below denoting successful authentication. Use readable real monospace text. Clipboard, browser and terminal should form a polished coherent editorial still life, not a busy infographic, with visual hierarchy and all labels readable at 700px width. Include only the listed literal text, no extra prose, no numbers. Avoid exact reproduction of GitHub UI or logos, avoid GitHub mascot. Technical constraint: the copied file is .pub; never show a private key pasted into GitHub. The terminal test is the single command ssh -T git@github.com.
```

### passphrase-ssh-agent

```text
Use case: scientific-educational. Asset type: original in-article editorial illustration for a beginner's guide titled What Is an SSH Key. Style: premium restrained editorial illustration, slightly isometric tactile paper-and-matte-ceramic forms, precise charcoal linework, subtle fine paper texture and soft realistic ambient shadows. Warm ivory background #FAF9F6, charcoal #3D3B35, muted terracotta #C56B4C and sage green #7E9681, matching a calm developer website. Landscape 3:2 canvas, ideally 1536x1024, generous 8 percent outer margin. Large easily understood objects, generous breathing room; short technical labels in exceptionally legible dark monospace. No title, no paragraphs, no tiny decorative code, no holograms, no neon, no photo, no watermark. All important elements must be legible when displayed 700px wide. This is an educational metaphor, not an application screenshot.
Primary request: Explain passphrase encryption at rest versus ssh-agent holding an unlocked private key in local memory. A large elegantly drawn open laptop is the enclosing local-device boundary, filling most of the frame. Inside its screen are two distinct areas as one balanced editorial scene: left a small disk-like folder vault containing a terracotta file labelled exactly "id_ed25519" and overlaid with a closed padlock. Below the vault, a simple password-entry capsule displays six large bullets, representing the passphrase; its curved short arrow points to an unlocking padlock at the middle. To the right is a sage memory chip labelled exactly "ssh-agent" containing a small terracotta key motif, clearly representing the unlocked key held in RAM after entering the passphrase. A quiet circular-arrow motif around the chip conveys reuse in the local session, without arrows leaving the laptop. Keep the locked file on disk visibly separate from the key in memory. This image is about local storage and convenient local unlocking, no servers or cloud, no code-host window, no network arrows. Text (verbatim), only "id_ed25519" and "ssh-agent" plus six password bullets. No extra labels. Technical constraint: passphrase protects the private key FILE on disk, agent holds the decrypted private key in memory, private key remains local. Do not depict uploading keys, passphrase as server login password, or an encrypted key remaining encrypted inside the running agent.
```

## Targeted correction to the GitHub illustration

The original generation wrapped the terminal command over two lines. A targeted edit added a shell continuation backslash so that the illustrated command is valid.

```text
Use case: precise-object-edit. Edit the referenced GitHub setup illustration. Change ONLY the first text line in the dark terminal on the right from "ssh -T" to "ssh -T \\" using a SINGLE visible backslash after a space at the end, the standard shell line-continuation character. The second line remains exactly "git@github.com". The command spans two visual lines, so the first line must contain exactly these characters: s s h SPACE - T SPACE BACKSLASH. Render exactly one backslash, not two. Keep every other element unchanged: composition, clipboard filename, GitHub browser text, checkmark, arrows, palette, paper texture, lighting, canvas dimensions. No other changes.
```
