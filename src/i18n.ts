// ===== Internationalization =====
export type Lang = 'vi' | 'en';

export interface Translations {
  // Navbar
  navProjects: string;
  navHowItWorks: string;
  navGuide: string;
  navContribute: string;

  // Hero
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSub1: string;
  heroSub2: string;
  heroSubmit: string;
  heroExplore: string;
  terminalSuccess: string;

  // How it works
  howTag: string;
  howTitle1: string;
  howTitle2: string;
  howDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Projects
  projTag: string;
  projTitle1: string;
  projTitle2: string;
  projDesc: string;
  filterAll: string;
  emptyTitle: string;
  emptyDesc: string;
  emptyBtn: string;

  // Stats
  statProjects: string;
  statContributors: string;
  statCategories: string;
  statFree: string;

  // CTA
  ctaTitle: string;
  ctaDesc: string;
  ctaSubmit: string;
  ctaGuide: string;

  // Footer
  footerTag: string;
  footerGuide: string;

  // Guide page
  guideBack: string;
  guideTag: string;
  guideTitle: string;
  guideSub: string;
  guideReqTitle: string;
  guideReq1: string;
  guideReq2: string;
  guideReq3: string;
  guideReq4: string;
  guideReq5: string;
  guideStepsTitle: string;
  guideStep1: string;
  guideStep1Desc: string;
  guideStep2: string;
  guideStep2Desc: string;
  guideStep3: string;
  guideStep3Desc: string;
  guideStep3Cat: string;
  guideStep4: string;
  guideStep4Desc: string;
  guideCheckTitle: string;
  guideCheck1: string;
  guideCheck2: string;
  guideCheck3: string;
  guideCheck4: string;
  guideCheck5: string;
  guideCheck6: string;
  guideFaqTitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  guideCta: string;
}

const vi: Translations = {
  navProjects: 'Projects',
  navHowItWorks: 'Cách hoạt động',
  navGuide: 'Hướng dẫn',
  navContribute: 'Contribute',

  heroBadge: 'Open Source · Miễn phí · Cho sinh viên',
  heroTitle1: 'Biến ý tưởng thành',
  heroTitle2: 'sản phẩm thực tế',
  heroSub1: 'Bạn có ý tưởng web, game, hay tool nhưng không biết deploy?',
  heroSub2: 'Submit qua <strong>GitHub PR</strong> — chúng tôi lo phần còn lại.',
  heroSubmit: 'Submit Project',
  heroExplore: 'Khám phá Projects ↓',
  terminalSuccess: '✓ Deployed at enolalab.pages.dev/projects/my-project',

  howTag: 'Quy trình',
  howTitle1: 'Đơn giản như ',
  howTitle2: '1-2-3',
  howDesc: 'Chỉ cần biết Git cơ bản, bạn đã có thể showcase project cho cả thế giới.',
  step1Title: 'Fork & Clone',
  step1Desc: 'Fork repo, thêm project vào folder <code>projects/</code>.',
  step2Title: 'Tạo Pull Request',
  step2Desc: 'Điền thông tin theo template, tạo PR.',
  step3Title: 'Auto Deploy 🚀',
  step3Desc: 'Merge → Cloudflare Pages tự deploy. Live trên internet!',

  projTag: 'Showcase',
  projTitle1: 'Projects từ ',
  projTitle2: 'cộng đồng',
  projDesc: 'Những ý tưởng tuyệt vời từ sinh viên Việt Nam.',
  filterAll: 'Tất cả',
  emptyTitle: 'Chưa có project nào',
  emptyDesc: 'Hãy là người đầu tiên submit!',
  emptyBtn: 'Submit ngay',

  statProjects: 'Projects',
  statContributors: 'Contributors',
  statCategories: 'Categories',
  statFree: '% Miễn phí',

  ctaTitle: 'Sẵn sàng showcase project?',
  ctaDesc: 'Chỉ cần một PR trên GitHub, project của bạn sẽ live trên internet.<br/>Không cần domain, không cần hosting, hoàn toàn miễn phí.',
  ctaSubmit: 'Submit Project',
  ctaGuide: 'Đọc hướng dẫn',

  footerTag: 'Made with 💜 for Vietnamese students',
  footerGuide: 'Hướng dẫn',

  guideBack: '← Về trang chủ',
  guideTag: 'Hướng dẫn',
  guideTitle: 'Submit project của bạn',
  guideSub: 'Chỉ cần vài bước đơn giản, project của bạn sẽ live trên internet.',
  guideReqTitle: '📋 Yêu cầu',
  guideReq1: 'Project phải là <strong>static</strong> (HTML/CSS/JS). Không hỗ trợ backend.',
  guideReq2: 'Nếu dùng framework (React, Vue, Svelte...) → phải <strong>build ra static files</strong> trước khi submit.',
  guideReq3: 'Tổng dung lượng project <strong>không quá 10MB</strong>.',
  guideReq4: 'Không chứa code độc hại, malware, hoặc nội dung vi phạm.',
  guideReq5: 'Phải có file <code>index.html</code> ở root folder của project.',
  guideStepsTitle: '🚀 Các bước thực hiện',
  guideStep1: 'Fork & Clone',
  guideStep1Desc: 'Fork repository trên GitHub, rồi clone về máy:',
  guideStep2: 'Tạo folder project',
  guideStep2Desc: 'Tạo folder trong <code>projects/</code> với tên dạng kebab-case:',
  guideStep3: 'Cập nhật registry.json',
  guideStep3Desc: 'Thêm entry mới vào mảng <code>projects</code> trong file <code>registry.json</code>:',
  guideStep3Cat: '<strong>Category hợp lệ:</strong> <code>web</code>, <code>game</code>, <code>tool</code>, <code>ai</code>, <code>other</code>',
  guideStep4: 'Tạo Pull Request',
  guideStep4Desc: 'Sau đó vào GitHub tạo Pull Request. Sử dụng PR template có sẵn.',
  guideCheckTitle: '✅ Checklist trước khi submit',
  guideCheck1: 'Folder project nằm trong <code>projects/</code>',
  guideCheck2: 'Có file <code>index.html</code> ở root folder',
  guideCheck3: 'Đã thêm entry vào <code>registry.json</code>',
  guideCheck4: 'Tổng dung lượng &lt; 10MB',
  guideCheck5: 'Không chứa API keys, secrets',
  guideCheck6: 'Project chạy được bằng cách mở <code>index.html</code>',
  guideFaqTitle: '❓ FAQ',
  faq1Q: 'Project có cần responsive không?',
  faq1A: 'Không bắt buộc, nhưng khuyến khích để trải nghiệm tốt hơn.',
  faq2Q: 'Tôi có thể dùng framework (React, Vue...)?',
  faq2A: 'Được! Nhưng bạn phải build ra static files trước khi submit. Chỉ submit output build.',
  faq3Q: 'Tôi muốn cập nhật project đã submit?',
  faq3A: 'Tạo PR mới cập nhật files trong folder project của bạn.',
  faq4Q: 'Mất bao lâu để PR được review?',
  faq4A: 'Thường trong vòng 24-48 giờ.',
  guideCta: 'Bắt đầu submit ngay',
};

const en: Translations = {
  navProjects: 'Projects',
  navHowItWorks: 'How it works',
  navGuide: 'Guide',
  navContribute: 'Contribute',

  heroBadge: 'Open Source · Free · For students',
  heroTitle1: 'Turn ideas into',
  heroTitle2: 'real products',
  heroSub1: "Have a web, game, or tool idea but don't know how to deploy?",
  heroSub2: 'Submit via <strong>GitHub PR</strong> — we handle the rest.',
  heroSubmit: 'Submit Project',
  heroExplore: 'Explore Projects ↓',
  terminalSuccess: '✓ Deployed at enolalab.pages.dev/projects/my-project',

  howTag: 'Process',
  howTitle1: 'Simple as ',
  howTitle2: '1-2-3',
  howDesc: 'Just basic Git knowledge and you can showcase your project to the world.',
  step1Title: 'Fork & Clone',
  step1Desc: 'Fork the repo, add your project to the <code>projects/</code> folder.',
  step2Title: 'Create Pull Request',
  step2Desc: 'Fill in the template, create a PR.',
  step3Title: 'Auto Deploy 🚀',
  step3Desc: 'Merge → Cloudflare Pages auto-deploys. Live on the internet!',

  projTag: 'Showcase',
  projTitle1: 'Projects from the ',
  projTitle2: 'community',
  projDesc: 'Amazing ideas from Vietnamese students.',
  filterAll: 'All',
  emptyTitle: 'No projects yet',
  emptyDesc: 'Be the first to submit!',
  emptyBtn: 'Submit now',

  statProjects: 'Projects',
  statContributors: 'Contributors',
  statCategories: 'Categories',
  statFree: '% Free',

  ctaTitle: 'Ready to showcase your project?',
  ctaDesc: 'Just one PR on GitHub and your project goes live.<br/>No domain, no hosting, completely free.',
  ctaSubmit: 'Submit Project',
  ctaGuide: 'Read the guide',

  footerTag: 'Made with 💜 for Vietnamese students',
  footerGuide: 'Guide',

  guideBack: '← Back to home',
  guideTag: 'Guide',
  guideTitle: 'Submit your project',
  guideSub: 'Just a few simple steps and your project will be live on the internet.',
  guideReqTitle: '📋 Requirements',
  guideReq1: 'Project must be <strong>static</strong> (HTML/CSS/JS). No backend support.',
  guideReq2: 'If using a framework (React, Vue, Svelte...) → <strong>build to static files</strong> before submitting.',
  guideReq3: 'Total project size <strong>must not exceed 10MB</strong>.',
  guideReq4: 'No malicious code, malware, or illegal content.',
  guideReq5: 'Must have an <code>index.html</code> at the project root folder.',
  guideStepsTitle: '🚀 Steps',
  guideStep1: 'Fork & Clone',
  guideStep1Desc: 'Fork the repository on GitHub, then clone it:',
  guideStep2: 'Create project folder',
  guideStep2Desc: 'Create a folder in <code>projects/</code> using kebab-case:',
  guideStep3: 'Update registry.json',
  guideStep3Desc: 'Add a new entry to the <code>projects</code> array in <code>registry.json</code>:',
  guideStep3Cat: '<strong>Valid categories:</strong> <code>web</code>, <code>game</code>, <code>tool</code>, <code>ai</code>, <code>other</code>',
  guideStep4: 'Create Pull Request',
  guideStep4Desc: 'Then go to GitHub and create a Pull Request. Use the provided PR template.',
  guideCheckTitle: '✅ Checklist before submitting',
  guideCheck1: 'Project folder is inside <code>projects/</code>',
  guideCheck2: 'Has an <code>index.html</code> at the root folder',
  guideCheck3: 'Added entry to <code>registry.json</code>',
  guideCheck4: 'Total size &lt; 10MB',
  guideCheck5: 'No API keys or secrets',
  guideCheck6: 'Project works by opening <code>index.html</code> directly',
  guideFaqTitle: '❓ FAQ',
  faq1Q: 'Does the project need to be responsive?',
  faq1A: 'Not required, but recommended for a better experience.',
  faq2Q: 'Can I use a framework (React, Vue...)?',
  faq2A: 'Yes! But you must build to static files before submitting. Only submit the build output.',
  faq3Q: 'How do I update a submitted project?',
  faq3A: 'Create a new PR updating the files in your project folder.',
  faq4Q: 'How long does the review take?',
  faq4A: 'Usually within 24-48 hours.',
  guideCta: 'Start submitting now',
};

const translations: Record<Lang, Translations> = { vi, en };

let currentLang: Lang = (localStorage.getItem('lang') as Lang) || 'vi';

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.setAttribute('lang', lang);
}

export function t(): Translations {
  return translations[currentLang];
}
