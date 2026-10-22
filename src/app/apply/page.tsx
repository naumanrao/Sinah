'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  User,
  BookOpen,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  FileCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Eye,
  Check,
  ShieldAlert,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface Program {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  duration: string;
  eligibility: string;
  application_fee: number;
  session_id: string;
  session_title: string;
  documents?: {
    id: string;
    document_name: string;
    document_description: string;
    is_required: number;
  }[];
}

interface Qualification {
  degree: string;
  board_university: string;
  institution_name: string;
  passing_year: number | '';
  obtained_marks: number | '';
  total_marks: number | '';
  percentage: number;
}

interface UploadedDoc {
  id: string;
  program_document_id?: string;
  document_name: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  verification_status: string;
}

function ApplyFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProgramId = searchParams.get('program') || '';
  const existingAppId = searchParams.get('appId') || '';

  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successApp, setSuccessApp] = useState<{ referenceNumber: string; id: string } | null>(null);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  // Application Form State
  const [appId, setAppId] = useState(existingAppId);
  const [personalInfo, setPersonalInfo] = useState({
    full_name: '',
    father_name: '',
    date_of_birth: '',
    gender: 'Male',
    cnic: '',
    nationality: 'Pakistani',
    domicile: '',
    email: '',
    phone: '',
    alternate_phone: '',
    current_address: '',
    permanent_address: '',
  });

  const [qualifications, setQualifications] = useState<Qualification[]>([
    {
      degree: 'Matric / SSC (Science)',
      board_university: '',
      institution_name: '',
      passing_year: '',
      obtained_marks: '',
      total_marks: '',
      percentage: 0,
    },
    {
      degree: 'F.Sc / HSSC (Pre-Medical)',
      board_university: '',
      institution_name: '',
      passing_year: '',
      obtained_marks: '',
      total_marks: '',
      percentage: 0,
    },
  ]);

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [uploadingDocName, setUploadingDocName] = useState<string | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Load programs and existing draft
  useEffect(() => {
    async function init() {
      try {
        const progRes = await fetch('/api/programs');
        const progData = await progRes.json();
        if (progData.success && progData.data) {
          setPrograms(progData.data);
          if (progData.data.length > 0) {
            const match = progData.data.find((p: Program) => p.id === initialProgramId) || progData.data[0];
            setSelectedProgramId(match.id);
            setSelectedSessionId(match.session_id);
          }
        }

        // If user is logged in and personal info empty, pre-fill from user
        if (user) {
          setPersonalInfo((prev) => ({
            ...prev,
            full_name: prev.full_name || user.full_name,
            email: prev.email || user.email,
            phone: prev.phone || user.phone,
          }));
        }

        // If loading existing draft
        if (existingAppId) {
          const appRes = await fetch(`/api/applications/${existingAppId}`);
          const appData = await appRes.json();
          if (appData.success && appData.data) {
            const a = appData.data;
            setAppId(a.id);
            setSelectedProgramId(a.program_id);
            setSelectedSessionId(a.session_id);
            setPersonalInfo({
              full_name: a.full_name || '',
              father_name: a.father_name || '',
              date_of_birth: a.date_of_birth || '',
              gender: a.gender || 'Male',
              cnic: a.cnic || '',
              nationality: a.nationality || 'Pakistani',
              domicile: a.domicile || '',
              email: a.email || '',
              phone: a.phone || '',
              alternate_phone: a.alternate_phone || '',
              current_address: a.current_address || '',
              permanent_address: a.permanent_address || '',
            });
            if (a.qualifications && a.qualifications.length > 0) {
              setQualifications(a.qualifications);
            }
            if (a.documents) {
              setUploadedDocs(a.documents);
            }
            if (a.current_step) {
              setStep(a.current_step);
            }
          }
        }
      } catch (err) {
        console.error('Init error', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      init();
    }
  }, [user, authLoading, initialProgramId, existingAppId]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  // Update session ID when program changes
  const handleProgramSelect = (progId: string) => {
    setSelectedProgramId(progId);
    const p = programs.find((x) => x.id === progId);
    if (p) setSelectedSessionId(p.session_id);
  };

  const handleQualificationChange = (index: number, field: keyof Qualification, val: string | number) => {
    const list = [...qualifications];
    list[index] = { ...list[index], [field]: val };

    // Auto-compute percentage
    const obt = parseFloat(String(list[index].obtained_marks)) || 0;
    const tot = parseFloat(String(list[index].total_marks)) || 0;
    if (tot > 0) {
      list[index].percentage = parseFloat(((obt / tot) * 100).toFixed(2));
    } else {
      list[index].percentage = 0;
    }

    setQualifications(list);
  };

  const addQualification = () => {
    setQualifications([
      ...qualifications,
      {
        degree: 'Diploma / Degree / Other',
        board_university: '',
        institution_name: '',
        passing_year: '',
        obtained_marks: '',
        total_marks: '',
        percentage: 0,
      },
    ]);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  // Document Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!appId) {
      // Must save draft first to obtain appId
      const saved = await saveDraft(false);
      if (!saved) {
        setError('Please save draft before uploading files.');
        return;
      }
    }

    setUploadingDocName(docName);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('application_id', appId);
    formData.append('document_name', docName);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Refresh docs list
        const appRes = await fetch(`/api/applications/${appId}`);
        const appData = await appRes.json();
        if (appData.success && appData.data?.documents) {
          setUploadedDocs(appData.data.documents);
        }
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('File upload failed. Please try again.');
    } finally {
      setUploadingDocName(null);
    }
  };

  // Save Draft
  const saveDraft = async (showNotice = true): Promise<boolean> => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appId || undefined,
          session_id: selectedSessionId || selectedProgram?.session_id,
          program_id: selectedProgramId,
          ...personalInfo,
          current_step: step,
          qualifications,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppId(data.data.id);
        if (showNotice) {
          setError(null);
        }
        return true;
      } else {
        setError(data.error || 'Could not save draft.');
        return false;
      }
    } catch {
      setError('Failed to save draft.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Step Navigations
  const handleNext = async () => {
    setError(null);

    if (step === 1) {
      if (!selectedProgramId) {
        setError('Please select an academic program.');
        return;
      }
    } else if (step === 2) {
      if (!personalInfo.full_name || !personalInfo.father_name || !personalInfo.cnic || !personalInfo.phone) {
        setError('Please fill in Full Name, Father Name, CNIC, and Phone Number.');
        return;
      }
    } else if (step === 3) {
      const matric = qualifications[0];
      if (!matric || !matric.obtained_marks || !matric.total_marks || !matric.board_university) {
        setError('Please enter complete Matriculation marks and Board.');
        return;
      }
    }

    const saved = await saveDraft(false);
    if (saved) {
      setStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Application Submission
  const handleSubmitFinal = async () => {
    if (!declarationAccepted) {
      setError('You must accept the applicant declaration before submitting.');
      return;
    }

    if (!appId) {
      setError('Application ID missing. Please save and retry.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessApp({
          referenceNumber: data.data.reference_number,
          id: appId,
        });
      } else {
        setError(data.error || 'Submission failed. Please check required fields/documents.');
      }
    } catch {
      setError('Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-slate-500 font-semibold">Loading Admission Application...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
            <GraduationCap size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sign In Required</h2>
            <p className="text-slate-500 text-sm mt-2">
              Please sign in or create an applicant account to fill out and submit your online admission form.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href={`/auth/login?redirect=${encodeURIComponent('/apply')}`}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all block"
            >
              Sign In to Continue
            </Link>
            <Link
              href="/auth/register"
              className="w-full py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all block text-sm"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Submission Success Screen
  if (successApp) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={44} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              Application Submitted Successfully
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">
              Congratulations, {personalInfo.full_name || user.full_name}!
            </h1>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Your application for <strong className="text-primary">{selectedProgram?.name}</strong> has been received by the SINAH Admission Office.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 max-w-md mx-auto space-y-2">
            <div className="text-xs text-slate-500 font-medium">Your Application Reference Number</div>
            <div className="text-2xl font-black text-primary tracking-wider font-mono">
              {successApp.referenceNumber}
            </div>
            <div className="text-[11px] text-slate-400">
              Please save this reference number for all future correspondence.
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all text-center"
            >
              Go to Applicant Dashboard
            </Link>
            <Link
              href={`/dashboard/applications/${successApp.id}`}
              className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-center"
            >
              View Application Dossier
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: 'Program Choice' },
    { num: 2, label: 'Personal Info' },
    { num: 3, label: 'Qualifications' },
    { num: 4, label: 'Documents' },
    { num: 5, label: 'Review & Submit' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Title */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                Online Application Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mt-2">
                SINAH Admission Application
              </h1>
            </div>

            {appId && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveDraft(true)}
                  disabled={saving}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save Draft</span>
                </button>
              </div>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-8 bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-md">
            <div className="grid grid-cols-5 gap-2">
              {stepsList.map((s) => (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                      step === s.num
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : step > s.num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.num ? <Check size={16} /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                      step === s.num ? 'text-primary font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm"
          >
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Multi-Step Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-10">
          {/* STEP 1: Program & Session Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Step 1: Select Your Degree / Diploma Program</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Choose the academic program you wish to enroll in for the current admission session.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {programs.map((prog) => {
                  const isSelected = selectedProgramId === prog.id;
                  return (
                    <div
                      key={prog.id}
                      onClick={() => handleProgramSelect(prog.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {prog.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-bold text-secondary">
                            PKR {prog.application_fee?.toLocaleString() || 0}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">{prog.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prog.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span>Duration: {prog.duration}</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-primary text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Personal & Contact Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Step 2: Personal & Contact Information</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Please provide accurate information as stated on your CNIC / Matriculation certificate.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Applicant Full Name *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.full_name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })}
                    placeholder="Full name as per Matric Certificate"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Father / Guardian Name *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.father_name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, father_name: e.target.value })}
                    placeholder="Father's full name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={personalInfo.date_of_birth}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender *
                  </label>
                  <select
                    value={personalInfo.gender}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    CNIC / B-Form Number *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.cnic}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, cnic: e.target.value })}
                    placeholder="e.g. 32304-1234567-1"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    District Domicile *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.domicile}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, domicile: e.target.value })}
                    placeholder="e.g. Muzaffargarh / Multan / Lahore"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile / WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    placeholder="0300 1234567"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Postal Address *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.current_address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, current_address: e.target.value })}
                    placeholder="House / Street / City"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Academic Qualifications */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Step 3: Academic Qualifications</h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Enter your Matriculation (SSC) and Intermediate (HSSC) details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQualification}
                  className="text-xs font-bold text-primary hover:underline self-start"
                >
                  + Add Another Degree
                </button>
              </div>

              <div className="space-y-6 pt-2">
                {qualifications.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {q.degree}
                      </span>
                      {idx >= 2 && (
                        <button
                          type="button"
                          onClick={() => removeQualification(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Degree / Certificate Title
                        </label>
                        <input
                          type="text"
                          value={q.degree}
                          onChange={(e) => handleQualificationChange(idx, 'degree', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Board / University *
                        </label>
                        <input
                          type="text"
                          value={q.board_university}
                          onChange={(e) => handleQualificationChange(idx, 'board_university', e.target.value)}
                          placeholder="e.g. BISE Dera Ghazi Khan / Multan"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Passing Year *
                        </label>
                        <input
                          type="number"
                          value={q.passing_year}
                          onChange={(e) => handleQualificationChange(idx, 'passing_year', e.target.value)}
                          placeholder="e.g. 2023"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Obtained Marks *
                        </label>
                        <input
                          type="number"
                          value={q.obtained_marks}
                          onChange={(e) => handleQualificationChange(idx, 'obtained_marks', e.target.value)}
                          placeholder="e.g. 920"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Total Marks *
                        </label>
                        <input
                          type="number"
                          value={q.total_marks}
                          onChange={(e) => handleQualificationChange(idx, 'total_marks', e.target.value)}
                          placeholder="e.g. 1100"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Percentage (%)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={q.percentage ? `${q.percentage}%` : '0%'}
                          className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-primary cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Document Uploads */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Step 4: Upload Required Documents</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Upload clear scanned copies or photos in PDF, JPEG, or PNG formats (Max 5MB each).
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  'Passport Size Photograph',
                  'CNIC / B-Form (Front & Back)',
                  'Father / Guardian CNIC',
                  'Matric / SSC Certificate & DMC',
                  'F.Sc / HSSC Marks Sheet',
                  'Domicile Certificate',
                ].map((docName, idx) => {
                  const existing = uploadedDocs.find((d) => d.document_name === docName);
                  const isUploading = uploadingDocName === docName;

                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{docName}</span>
                          {existing ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 size={12} /> Uploaded
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        {existing && (
                          <p className="text-xs text-slate-500">
                            File: {existing.original_filename} ({(existing.file_size / 1024).toFixed(0)} KB)
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {existing && (
                          <a
                            href={`/api/documents/${existing.stored_filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Eye size={14} /> View
                          </a>
                        )}

                        <label className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/10">
                          {isUploading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              <span>{existing ? 'Replace File' : 'Upload File'}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={(e) => handleFileUpload(e, docName)}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Step 5: Review Application & Submit</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Please review all entered information carefully before final submission.
                </p>
              </div>

              {/* Review Summary Dossier */}
              <div className="space-y-4 pt-2">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Program Details</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><strong className="text-slate-700">Program:</strong> {selectedProgram?.name}</div>
                    <div><strong className="text-slate-700">Application Fee:</strong> PKR {selectedProgram?.application_fee?.toLocaleString()}</div>
                    <div><strong className="text-slate-700">Duration:</strong> {selectedProgram?.duration}</div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Personal Information</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div><strong className="text-slate-700">Name:</strong> {personalInfo.full_name}</div>
                    <div><strong className="text-slate-700">Father Name:</strong> {personalInfo.father_name}</div>
                    <div><strong className="text-slate-700">CNIC:</strong> {personalInfo.cnic}</div>
                    <div><strong className="text-slate-700">Date of Birth:</strong> {personalInfo.date_of_birth}</div>
                    <div><strong className="text-slate-700">Phone:</strong> {personalInfo.phone}</div>
                    <div><strong className="text-slate-700">Email:</strong> {personalInfo.email}</div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Academic Marks</span>
                  <div className="space-y-2">
                    {qualifications.map((q, idx) => (
                      <div key={idx} className="text-xs flex justify-between border-b border-slate-200/60 pb-1">
                        <span>{q.degree} ({q.board_university}):</span>
                        <strong>{q.obtained_marks}/{q.total_marks} ({q.percentage}%)</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Undertaking Declaration */}
                <div className="p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/30"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed font-medium">
                      I solemnly declare that all particulars entered in this online application form are true and correct to the best of my knowledge. I understand that any false information or forged documents will result in immediate cancellation of my admission at any stage.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 text-xs sm:text-sm"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center gap-2 text-xs sm:text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitFinal}
                disabled={submitting}
                className="px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2 text-xs sm:text-sm disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
      <ApplyFormContent />
    </Suspense>
  );
}
