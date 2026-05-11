import { Event, EventCategory } from '../types';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Industry Networking Night — IT & Business',
    description: 'Join us for an evening of networking with industry professionals from Sydney\'s tech and business sectors. Representatives from leading firms will be in attendance. This is your chance to make valuable connections, learn about career opportunities, and gain insights into the industry. Light refreshments provided.',
    date: '2026-05-23',
    startTime: '18:00',
    endTime: '21:00',
    location: 'Level 11, 10 Barrack St, Sydney',
    category: 'Career',
    organiserId: '1',
    organiserName: 'Student Services',
    status: 'published',
    viewCount: 210,
    rsvpCount: 48,
    notes: 'Business casual dress recommended. Please bring your student ID.',
    createdAt: '2026-04-15T10:00:00Z',
    capacity: 80,
    registrationRequired: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1775163560631-6ff15eb2fa1f?w=600',
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1775163560631-6ff15eb2fa1f?w=1200',
        alt: 'People mingling at an indoor event',
        photographer: 'Olena Kholina',
        photographerUrl: 'https://unsplash.com/@sixtynice'
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1769798643237-8642a3fbe5bc?w=1200',
        alt: 'Diverse audience at conference',
        photographer: 'Carlos Gil',
        photographerUrl: 'https://unsplash.com/@carlosgil83'
      }
    ],
    volunteering: {
      needed: true,
      totalSpots: 5,
      filledSpots: 3,
      positions: [
        {
          id: 'v1',
          title: 'Registration Desk Assistant',
          description: 'Help check-in attendees and distribute name tags',
          spots: 2,
          filledSpots: 1,
          requirements: ['Good communication skills', 'Punctual']
        },
        {
          id: 'v2',
          title: 'Event Photographer',
          description: 'Capture photos of the networking event',
          spots: 1,
          filledSpots: 1,
          requirements: ['Photography experience', 'Own camera']
        },
        {
          id: 'v3',
          title: 'Setup & Cleanup Crew',
          description: 'Assist with event setup and post-event cleanup',
          spots: 2,
          filledSpots: 1,
          requirements: ['Physical fitness', 'Team player']
        }
      ]
    },
    seating: {
      available: true,
      type: 'open',
      capacity: 80,
      remaining: 32,
      accessibility: true
    },
    food: {
      provided: true,
      type: 'refreshments',
      menu: ['Canapés', 'Finger sandwiches', 'Cheese platter', 'Fruit platter'],
      dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-free'],
      cost: 0
    },
    tags: ['Networking', 'IT', 'Business', 'Professional Development']
  },
  {
    id: '2',
    title: 'Accounting Career Fair',
    description: 'Meet with top accounting firms and learn about graduate opportunities. Major firms including PwC, Deloitte, KPMG, and EY will have representatives on-site. Bring your resume and be prepared to network! This is an excellent opportunity to explore internships, graduate programs, and full-time positions.',
    date: '2026-05-26',
    startTime: '10:00',
    endTime: '14:00',
    location: 'Level 10, Queen St Campus',
    category: 'Career',
    organiserId: '1',
    organiserName: 'Business Department',
    status: 'published',
    viewCount: 88,
    rsvpCount: 31,
    createdAt: '2026-04-18T09:00:00Z',
    capacity: 100,
    registrationRequired: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1767974817923-7e36959bed68?w=600',
    images: [
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1767974817923-7e36959bed68?w=1200',
        alt: 'Career fair interaction',
        photographer: 'tommao wang',
        photographerUrl: 'https://unsplash.com/@tommaomaoer'
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1716703741355-30379d2e9de6?w=1200',
        alt: 'Professional recruitment event',
        photographer: 'Musemind UX Agency',
        photographerUrl: 'https://unsplash.com/@musemindagency'
      }
    ],
    volunteering: {
      needed: true,
      totalSpots: 4,
      filledSpots: 2,
      positions: [
        {
          id: 'v4',
          title: 'Company Booth Assistant',
          description: 'Help companies set up their booths',
          spots: 2,
          filledSpots: 1,
          requirements: ['Organized', 'Helpful attitude']
        },
        {
          id: 'v5',
          title: 'Information Desk',
          description: 'Answer questions and provide directions',
          spots: 2,
          filledSpots: 1,
          requirements: ['Knowledge of campus', 'Friendly demeanor']
        }
      ]
    },
    seating: {
      available: true,
      type: 'open',
      capacity: 100,
      remaining: 69,
      accessibility: true
    },
    food: {
      provided: true,
      type: 'refreshments',
      menu: ['Coffee', 'Tea', 'Pastries', 'Cookies'],
      dietaryOptions: ['Vegetarian', 'Gluten-free'],
      cost: 0
    },
    tags: ['Career Fair', 'Accounting', 'Graduate Jobs', 'Recruitment']
  },
  {
    id: '3',
    title: 'Welcome BBQ — Trimester 2',
    description: 'Start the new trimester with a welcome BBQ! Meet new students, catch up with friends, and enjoy free food and refreshments. This is a great opportunity to connect with fellow students across all programs and make new friends. Games, music, and prizes included!',
    date: '2026-05-28',
    startTime: '12:00',
    endTime: '15:00',
    location: 'Sydney Campus Terrace',
    category: 'Social',
    organiserId: '2',
    organiserName: 'Student Union',
    status: 'published',
    viewCount: 174,
    rsvpCount: 93,
    notes: 'Free entry. Open to all Kent students.',
    createdAt: '2026-04-20T14:30:00Z',
    capacity: 150,
    registrationRequired: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1758850891011-1089de343ec6?w=600',
    images: [
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1758850891011-1089de343ec6?w=1200',
        alt: 'BBQ gathering with smoke',
        photographer: 'Sam Ruder',
        photographerUrl: 'https://unsplash.com/@samjruder'
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200',
        alt: 'Students laughing at party',
        photographer: 'Samantha Gades',
        photographerUrl: 'https://unsplash.com/@srosinger3997'
      }
    ],
    volunteering: {
      needed: true,
      totalSpots: 8,
      filledSpots: 6,
      positions: [
        {
          id: 'v6',
          title: 'BBQ Grill Master',
          description: 'Help cook food on the BBQ',
          spots: 3,
          filledSpots: 2,
          requirements: ['Cooking experience', 'Food safety knowledge']
        },
        {
          id: 'v7',
          title: 'Games Coordinator',
          description: 'Organize and run games and activities',
          spots: 2,
          filledSpots: 2,
          requirements: ['Energetic', 'Leadership skills']
        },
        {
          id: 'v8',
          title: 'Setup & Cleanup',
          description: 'Help with setup and cleanup',
          spots: 3,
          filledSpots: 2,
          requirements: ['Team player']
        }
      ]
    },
    seating: {
      available: true,
      type: 'open',
      capacity: 150,
      remaining: 57,
      accessibility: true,
      layout: 'Picnic tables and standing areas'
    },
    food: {
      provided: true,
      type: 'full-meal',
      menu: ['Burgers', 'Hot dogs', 'Veggie burgers', 'Salads', 'Soft drinks', 'Desserts'],
      dietaryOptions: ['Vegetarian', 'Vegan', 'Halal', 'Gluten-free'],
      cost: 0
    },
    tags: ['Social', 'BBQ', 'Welcome Event', 'Food', 'Games']
  },
  {
    id: '4',
    title: 'React & TypeScript Workshop',
    description: 'Hands-on workshop covering modern React development with TypeScript. Build a full-stack application from scratch. Learn best practices, state management, component architecture, and API integration. Perfect for students looking to enhance their web development skills. Laptops required.',
    date: '2026-05-30',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Computer Lab 3, Level 8',
    category: 'Workshop',
    organiserId: '3',
    organiserName: 'IT Society',
    status: 'published',
    viewCount: 156,
    rsvpCount: 45,
    notes: 'Bring your own laptop. Basic JavaScript knowledge required.',
    createdAt: '2026-04-22T11:00:00Z',
    capacity: 50,
    registrationRequired: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1726442050968-d243b28006cd?w=600',
    images: [
      {
        id: '7',
        url: 'https://images.unsplash.com/photo-1726442050968-d243b28006cd?w=1200',
        alt: 'Students working on laptops',
        photographer: 'Danielle-Claude Bélanger',
        photographerUrl: 'https://unsplash.com/@dcbelanger'
      },
      {
        id: '8',
        url: 'https://images.unsplash.com/photo-1635468073086-7edff555234a?w=1200',
        alt: 'Workshop collaboration',
        photographer: 'UX Indonesia',
        photographerUrl: 'https://unsplash.com/@uxindo'
      }
    ],
    volunteering: {
      needed: true,
      totalSpots: 2,
      filledSpots: 2,
      positions: [
        {
          id: 'v9',
          title: 'Technical Assistant',
          description: 'Help students with technical issues',
          spots: 2,
          filledSpots: 2,
          requirements: ['React knowledge', 'Patient', 'Helpful']
        }
      ]
    },
    seating: {
      available: true,
      type: 'assigned',
      capacity: 50,
      remaining: 5,
      accessibility: true,
      layout: 'Computer lab workstations'
    },
    food: {
      provided: true,
      type: 'snacks',
      menu: ['Pizza', 'Soft drinks', 'Water'],
      dietaryOptions: ['Vegetarian'],
      cost: 0
    },
    tags: ['Workshop', 'React', 'TypeScript', 'Web Development', 'Coding']
  },
  {
    id: '5',
    title: 'Study Skills Seminar',
    description: 'Learn effective study techniques, time management strategies, and exam preparation tips from academic advisors. Topics include note-taking methods, memory techniques, stress management, and creating effective study schedules. Open to all students who want to improve their academic performance.',
    date: '2026-06-02',
    startTime: '13:00',
    endTime: '15:00',
    location: 'Lecture Hall A',
    category: 'Academic',
    organiserId: '1',
    organiserName: 'Academic Support',
    status: 'published',
    viewCount: 92,
    rsvpCount: 28,
    createdAt: '2026-04-25T08:00:00Z',
    capacity: 60,
    registrationRequired: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1758270705482-cee87ea98738?w=600',
    images: [
      {
        id: '9',
        url: 'https://images.unsplash.com/photo-1758270705482-cee87ea98738?w=1200',
        alt: 'Students in lecture hall',
        photographer: 'Vitaly Gariev',
        photographerUrl: 'https://unsplash.com/@silverkblack'
      },
      {
        id: '10',
        url: 'https://images.unsplash.com/photo-1620458930576-3e18328ce1ba?w=1200',
        alt: 'Study group discussion',
        photographer: 'Albert Vincent Wu',
        photographerUrl: 'https://unsplash.com/@albertvincentwu'
      }
    ],
    volunteering: {
      needed: false
    },
    seating: {
      available: true,
      type: 'first-come',
      capacity: 60,
      remaining: 32,
      accessibility: true
    },
    food: {
      provided: false,
      type: 'none'
    },
    tags: ['Academic', 'Study Skills', 'Time Management', 'Exam Prep']
  },
  {
    id: '6',
    title: 'Gaming Tournament: Valorant',
    description: 'Join the Kent Gaming Club for our monthly Valorant tournament. Prizes for top 3 teams! Form your squad or join as a solo player and we\'ll match you with teammates. Tournament format: Double elimination bracket. Stream will be available for spectators. All skill levels welcome!',
    date: '2026-06-05',
    startTime: '18:00',
    endTime: '22:00',
    location: 'Gaming Lab, Level 7',
    category: 'Club',
    organiserId: '4',
    organiserName: 'Gaming Club',
    status: 'published',
    viewCount: 203,
    rsvpCount: 67,
    notes: 'Registration closes May 31st. Team size: 5 players.',
    createdAt: '2026-04-28T16:00:00Z',
    capacity: 80,
    registrationRequired: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1558008258-7ff8888b42b0?w=600',
    images: [
      {
        id: '11',
        url: 'https://images.unsplash.com/photo-1558008258-7ff8888b42b0?w=1200',
        alt: 'Gaming tournament in progress',
        photographer: 'Stem List',
        photographerUrl: 'https://unsplash.com/@stemlist'
      },
      {
        id: '12',
        url: 'https://images.unsplash.com/photo-1772587003187-65b32c91df91?w=1200',
        alt: 'Spectators watching gaming tournament',
        photographer: 'Les Taylor',
        photographerUrl: 'https://unsplash.com/@les_photograph'
      }
    ],
    volunteering: {
      needed: true,
      totalSpots: 3,
      filledSpots: 1,
      positions: [
        {
          id: 'v10',
          title: 'Tournament Organizer',
          description: 'Manage bracket and match schedules',
          spots: 1,
          filledSpots: 1,
          requirements: ['Gaming knowledge', 'Organized']
        },
        {
          id: 'v11',
          title: 'Stream Moderator',
          description: 'Manage live stream and chat',
          spots: 1,
          filledSpots: 0,
          requirements: ['Streaming experience']
        },
        {
          id: 'v12',
          title: 'Tech Support',
          description: 'Help with technical issues',
          spots: 1,
          filledSpots: 0,
          requirements: ['PC gaming knowledge']
        }
      ]
    },
    seating: {
      available: true,
      type: 'assigned',
      capacity: 80,
      remaining: 13,
      accessibility: true,
      layout: 'Gaming stations for players, spectator area'
    },
    food: {
      provided: true,
      type: 'snacks',
      menu: ['Energy drinks', 'Chips', 'Candy', 'Water'],
      dietaryOptions: ['Vegetarian'],
      cost: 0
    },
    tags: ['Gaming', 'Valorant', 'Tournament', 'Esports', 'Competition']
  },
  {
    id: '7',
    title: 'Sustainability Workshop',
    description: 'Interactive workshop on sustainable practices. Learn how to reduce your carbon footprint and contribute to a greener campus. Topics include recycling, composting, energy conservation, sustainable transportation, and eco-friendly lifestyle choices. Guest speaker from Sydney Environmental Council.',
    date: '2026-06-08',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Room 204, Building B',
    category: 'Workshop',
    organiserId: '5',
    organiserName: 'Environmental Society',
    status: 'published',
    viewCount: 75,
    rsvpCount: 22,
    createdAt: '2026-05-01T10:00:00Z',
    capacity: 40,
    registrationRequired: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1769034432267-0fd4a01d839f?w=600',
    images: [
      {
        id: '13',
        url: 'https://images.unsplash.com/photo-1769034432267-0fd4a01d839f?w=1200',
        alt: 'Women discussing around table',
        photographer: 'Sebastian Ciepiela',
        photographerUrl: 'https://unsplash.com/@sabetheodoore'
      }
    ],
    volunteering: {
      needed: true,
      totalSpots: 2,
      filledSpots: 0,
      positions: [
        {
          id: 'v13',
          title: 'Workshop Facilitator',
          description: 'Lead breakout discussion groups',
          spots: 2,
          filledSpots: 0,
          requirements: ['Interest in sustainability', 'Public speaking']
        }
      ]
    },
    seating: {
      available: true,
      type: 'first-come',
      capacity: 40,
      remaining: 18,
      accessibility: true
    },
    food: {
      provided: true,
      type: 'refreshments',
      menu: ['Organic coffee', 'Tea', 'Fruit'],
      dietaryOptions: ['Vegan', 'Organic'],
      cost: 0
    },
    tags: ['Sustainability', 'Environment', 'Workshop', 'Green Living']
  },
  {
    id: '8',
    title: 'Research Methodology Seminar',
    description: 'Essential seminar for students working on dissertations and research projects. Covers research design, data collection methods, qualitative and quantitative analysis, ethical considerations, and academic writing. Guest speakers include PhD supervisors and published researchers. Highly recommended for postgraduate students.',
    date: '2026-06-10',
    startTime: '15:00',
    endTime: '17:00',
    location: 'Seminar Room 3',
    category: 'Academic',
    organiserId: '1',
    organiserName: 'Research Office',
    status: 'published',
    viewCount: 64,
    rsvpCount: 19,
    createdAt: '2026-05-03T09:30:00Z',
    capacity: 35,
    registrationRequired: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1768448808550-3148cce53a19?w=600',
    images: [
      {
        id: '14',
        url: 'https://images.unsplash.com/photo-1768448808550-3148cce53a19?w=1200',
        alt: 'Audience listening to presentation',
        photographer: 'blue sky',
        photographerUrl: 'https://unsplash.com/@bluext'
      }
    ],
    volunteering: {
      needed: false
    },
    seating: {
      available: true,
      type: 'first-come',
      capacity: 35,
      remaining: 16,
      accessibility: true
    },
    food: {
      provided: true,
      type: 'refreshments',
      menu: ['Coffee', 'Tea', 'Biscuits'],
      dietaryOptions: ['Vegetarian'],
      cost: 0
    },
    tags: ['Research', 'Academic', 'Methodology', 'Dissertation', 'Postgraduate']
  },
];

export const eventCategories: EventCategory[] = [
  'Academic',
  'Social',
  'Career',
  'Club',
  'Workshop',
  'Other',
];
