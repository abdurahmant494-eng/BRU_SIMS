import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  GraduationCap,
  Compass,
  BookOpen,
  MapPin,
  ExternalLink,
  Shield,
  Award,
  Users,
  Layers,
  Globe,
  Mail,
  Phone,
} from 'lucide-react';

export const UniversityProfileView: React.FC = () => {
  const { departments, setActiveTab } = useApp();

  const collegesList = [
    {
      name: 'College of Pastoral Studies & Dryland Agriculture (CPSDA)',
      nameOm: 'Koolleejjii Qo\'annoo Tiksee fi Qonna Gammoojjii',
      description:
        'The flagship academic unit dedicated to dryland agronomy, rangeland ecology, animal nutrition & feed technology, climate resilience, and pastoral livelihoods.',
      departments: ['Animal Science', 'Plant Science & Agronomy', 'Natural Resource Management', 'Agricultural Economics', 'Climate Change & Sustainable Development (MSc)'],
      dean: 'Dr. Halake Guyo',
      email: 'cpsda@bru.edu.et',
    },
    {
      name: 'College of Engineering & Technology (COET)',
      nameOm: 'Koolleejjii Injinarummaa fi Teeknolojii',
      description:
        'Engineering solutions tailored to semi-arid infrastructure, water harvesting, civil engineering, electrical & computer systems, and informatics.',
      departments: ['Computer Science & Informatics', 'Water Resource & Irrigation Engineering', 'Civil Engineering', 'Electrical & Computer Engineering'],
      dean: 'Eng. Roba Sora',
      email: 'engineering@bru.edu.et',
    },
    {
      name: 'College of Business and Economics (COBE)',
      nameOm: 'Koolleejjii Daldalaa fi Ikonomiksii',
      description:
        'Fostering economic development, pastoral livestock market integration, cross-border trade corridors, microfinance, and accounting.',
      departments: ['Economics', 'Accounting & Finance', 'Management', 'Agribusiness & Value Chain Management'],
      dean: 'Mr. Liban Wako',
      email: 'cbe@bru.edu.et',
    },
    {
      name: 'Institute of Indigenous Democracy & Cultural Studies (IIDCS)',
      nameOm: 'Dhaabbata Dimokiraasii Dhalootaa fi Qo\'annoo Aadaa (Gadaa)',
      description:
        'Pioneering research center focused on the indigenous Gadaa democratic system, customary Oromo governance, conflict resolution mechanisms, and cultural heritage.',
      departments: ['Gadaa Democratic Studies', 'Indigenous Rangeland Governance', 'Oromo Oral History & Heritage Documentation'],
      dean: 'Dr. Dida Boru',
      email: 'gadaa.studies@bru.edu.et',
    },
    {
      name: 'School of Veterinary Medicine (SVM)',
      nameOm: 'Mana Barnootaa Qoricha Beeyladootaa',
      description:
        'Comprehensive clinical training addressing endemic livestock diseases, zoonotic epidemiology, herd health management, and veterinary pharmacology.',
      departments: ['Veterinary Clinical Studies', 'Microbiology & Pathology', 'Herd Health & Epidemiology'],
      dean: 'Dr. Guyo Molu',
      email: 'vetmed@bru.edu.et',
    },
    {
      name: 'College of Social Science & Humanities (CSSH)',
      nameOm: 'Koolleejjii Saayinsii Hawaasaa fi Namoomaa',
      description:
        'Humanities and social inquiries fostering language preservation, regional history, geography, and civic leadership.',
      departments: ['Afaan Oromo Literature & Communication', 'English Language & Literature', 'History & Heritage Management', 'Geography & Environmental Studies'],
      dean: 'Dr. Chaltu Doyo',
      email: 'cssh@bru.edu.et',
    },
    {
      name: 'School of Law & Human Rights',
      nameOm: 'Mana Barnootaa Seeraa fi Mirga Namoomaa',
      description:
        'Legal scholarship blending statutory Ethiopian constitutional law with customary pastoral jurisprudence and human rights advocacy.',
      departments: ['Public Law', 'Private & Commercial Law', 'Pastoral Jurisprudence'],
      dean: 'Ato Roba Galgallo',
      email: 'law@bru.edu.et',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              About Borana University (bru.edu.et)
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Institutional Profile
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official institutional information, academic structure, and portal integration for Borana University.
          </p>
        </div>

        <a
          href="https://www.bru.edu.et"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
        >
          <span>Visit Official Portal (bru.edu.et)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Hero Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-900">
          <img
            src="/src/assets/images/bru_campus_hero_1793125544198.jpg"
            alt="Borana University Main Campus Library"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/src/assets/images/bru_university_crest_1793125542443.jpg"
                alt="Borana University Crest"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full border-2 border-white/80 shadow-lg bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="text-white">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">BORANA UNIVERSITY</h2>
                <p className="text-xs sm:text-sm text-emerald-300 font-semibold italic">
                  "Dedicated to Resilient Pastoral Future"
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Main Campus: Yabello (Yaballo), Borana Zone, Oromia, Ethiopia
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs p-6 bg-slate-50/50">
          <div className="pr-0 md:pr-6 pb-4 md:pb-0 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Institutional Vision</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              Borana University aspires to be a leading university in East Africa in pastoralism and range ecology, governance, indigenous democracies, and cultural studies and research.
            </p>
          </div>

          <div className="pt-4 md:pt-0 pl-0 md:pl-6 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Institutional Mission</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              To deliver quality and relevant education in different modalities to produce competent, ethical, and problem-solving graduates; conduct impactful research that addresses national and community-level problems; and implement meaningful community engagements to promote sustainable development.
            </p>
          </div>
        </div>
      </div>

      {/* Executive Key Contacts & Office of the Registrar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
            <Building2 className="w-4 h-4" />
            <span>President's Office</span>
          </div>
          <span className="font-bold text-slate-900 block text-sm">Debano Bonaya Garmo</span>
          <p className="text-slate-500 text-xs">Head of President's Office & Institutional Governance</p>
          <div className="pt-2 border-t border-slate-100 text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>president.office@bru.edu.et</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Senate Hall, Administration Wing</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
            <Shield className="w-4 h-4" />
            <span>Office of the University Registrar</span>
          </div>
          <span className="font-bold text-slate-900 block text-sm">Mr. Wario Galma</span>
          <p className="text-slate-500 text-xs">Registrar Office Director · ARTTCSVP Division</p>
          <div className="pt-2 border-t border-slate-100 text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>registar@bru.edu.et / irc@bru.edu.et</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>P.O. Box 244, Main Campus, Yaballo</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
            <MapPin className="w-4 h-4" />
            <span>Campuses & Centers</span>
          </div>
          <span className="font-bold text-slate-900 block text-sm">Yaballo Main & Moyale</span>
          <p className="text-slate-500 text-xs">Strategically located 557 km south of Addis Ababa along the Ethio-Kenya corridor.</p>
          <div className="pt-2 border-t border-slate-100 text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Main Campus: Yabello (Yaballo)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Coordination Center: Moyale</span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Units: Colleges, Schools, and Institutes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Colleges, Schools, and Research Institutes
            </h2>
            <p className="text-xs text-slate-500">
              Structured academic units operating undergraduate and postgraduate programs under Borana University.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
            {collegesList.length} Units Active
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {collegesList.map((unit, idx) => (
            <div key={idx} className="p-6 hover:bg-slate-50/60 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{unit.name}</h3>
                  <span className="text-emerald-800 font-semibold text-[11px] block">{unit.nameOm}</span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700 block">Dean: {unit.dean}</span>
                  <span className="font-mono">{unit.email}</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">{unit.description}</p>

              <div>
                <span className="font-semibold text-slate-800 text-[11px] block mb-1.5">
                  Academic Departments & Degree Offerings:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {unit.departments.map((deptName, dIdx) => (
                    <span
                      key={dIdx}
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200"
                    >
                      {deptName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
