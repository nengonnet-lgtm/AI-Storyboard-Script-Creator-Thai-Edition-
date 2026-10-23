/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  Sparkles, 
  Camera, 
  Mic, 
  Layout, 
  Type as TypeIcon,
  RefreshCw,
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { 
  AppState, 
  ART_STYLES, 
  LOCATIONS, 
  LANGUAGE_STYLES, 
  STORYTELLING_STYLES, 
  CTA_OPTIONS, 
  STORYBOARD_TYPES, 
  PROMPT_TO_STORYBOARD_OPTIONS 
} from './types';
import { generateInitialContent, generateFullPrompts } from './services/geminiService';

const STEPS = [
  'ข้อมูลเริ่มต้น',
  'เลือกคอนเทนต์',
  'สถานที่',
  'รูปแบบภาษา',
  'การเล่าเรื่อง',
  'CTA',
  'สไตล์ภาพ',
  'สตอรี่บอร์ด',
  'ผลลัพธ์พรอมต์',
  'แคปชั่น',
  'ส่งออก'
];

export default function App() {
  const [state, setState] = useState<AppState>({
    step: 1,
    images: [],
    storySynopsis: '',
    generatedContents: [],
    selectedContent: '',
    location: '',
    customLocation: '',
    languageStyle: '',
    storytellingStyle: '',
    cta: '',
    artStyle: '',
    storyboardType: '',
    customStoryboardFrames: '4',
    promptType: '',
    generatedPrompts: [],
    captions: []
  });

  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setState(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const nextStep = async () => {
    if (state.step === 1) {
      if (!state.storySynopsis) return alert('กรุณาระบุเรื่องราวสั้นๆ');
      setLoading(true);
      try {
        const contents = await generateInitialContent(state.storySynopsis, state.images);
        setState(prev => ({ ...prev, generatedContents: contents, step: 2 }));
      } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการสร้างคอนเทนต์');
      } finally {
        setLoading(false);
      }
    } else if (state.step === 8) {
      setLoading(true);
      try {
        const result = await generateFullPrompts(state);
        setState(prev => ({ 
          ...prev, 
          generatedPrompts: result.scenes, 
          captions: result.captions,
          step: 9 
        }));
      } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการสร้างพรอมต์');
      } finally {
        setLoading(false);
      }
    } else {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-gray-dark">อัปโหลดรูปภาพตัวละครหรือสินค้า (VISUAL DNA)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-orange transition-colors bg-white/50"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่</p>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple className="hidden" accept="image/*" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                {state.images.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => removeImage(i)} className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-gray-dark">หัวข้อหรือเรื่องราวสั้นๆ (Story Synopsis)</label>
              <textarea
                value={state.storySynopsis}
                onChange={(e) => setState(prev => ({ ...prev, storySynopsis: e.target.value }))}
                placeholder="เช่น รีวิวคลอโรฟิลล์ช่วยเรื่องผิวใสและขับถ่าย..."
                className="w-full h-32 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-white"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gray-dark mb-4">เลือกหัวข้อคอนเทนต์ที่ต้องการ</h3>
            {state.generatedContents.map((content, i) => (
              <button
                key={i}
                onClick={() => setState(prev => ({ ...prev, selectedContent: content }))}
                className={`w-full p-4 text-left rounded-xl border transition-all ${
                  state.selectedContent === content 
                  ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20' 
                  : 'border-gray-200 bg-white hover:border-brand-orange/50'
                }`}
              >
                {content}
              </button>
            ))}
          </motion.div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LOCATIONS.map((loc, i) => (
              <button
                key={i}
                onClick={() => setState(prev => ({ ...prev, location: loc.label }))}
                className={`p-6 text-left rounded-2xl border transition-all ${
                  state.location === loc.label 
                  ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20' 
                  : 'border-gray-200 bg-white hover:border-brand-orange/50'
                }`}
              >
                <div className="font-bold mb-1">{loc.label}</div>
                <div className="text-xs text-gray-500">{loc.description}</div>
              </button>
            ))}
            {state.location === 'พิมพ์ระบุเอง' && (
              <textarea
                value={state.customLocation}
                onChange={(e) => setState(prev => ({ ...prev, customLocation: e.target.value }))}
                placeholder="ระบุสถานที่ของคุณ..."
                className="col-span-full mt-2 p-4 rounded-xl border border-gray-200 w-full"
              />
            )}
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-1 gap-4">
            {LANGUAGE_STYLES.map((style, i) => (
              <button
                key={i}
                onClick={() => setState(prev => ({ ...prev, languageStyle: style.label }))}
                className={`p-6 text-left rounded-2xl border transition-all ${
                  state.languageStyle === style.label 
                  ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20' 
                  : 'border-gray-200 bg-white hover:border-brand-orange/50'
                }`}
              >
                <div className="font-bold mb-1">{style.label}</div>
                <div className="text-sm text-gray-500">{style.description}</div>
              </button>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="grid grid-cols-1 gap-4">
            {STORYTELLING_STYLES.map((style, i) => (
              <button
                key={i}
                onClick={() => setState(prev => ({ ...prev, storytellingStyle: style.label }))}
                className={`p-6 text-left rounded-2xl border transition-all ${
                  state.storytellingStyle === style.label 
                  ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20' 
                  : 'border-gray-200 bg-white hover:border-brand-orange/50'
                }`}
              >
                <div className="font-bold mb-1">{style.label}</div>
                <div className="text-sm text-gray-500">{style.description}</div>
              </button>
            ))}
          </div>
        );

      case 6:
        return (
          <div className="grid grid-cols-1 gap-4">
            {CTA_OPTIONS.map((cta, i) => (
              <button
                key={i}
                onClick={() => setState(prev => ({ ...prev, cta: cta.label }))}
                className={`p-6 text-left rounded-2xl border transition-all ${
                  state.cta === cta.label 
                  ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20' 
                  : 'border-gray-200 bg-white hover:border-brand-orange/50'
                }`}
              >
                <div className="font-bold mb-1">{cta.label}</div>
                <div className="text-sm text-gray-500">{cta.description}</div>
              </button>
            ))}
          </div>
        );

      case 7:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ART_STYLES.map((style, i) => (
              <button
                key={i}
                onClick={() => setState(prev => ({ ...prev, artStyle: style.label }))}
                className={`p-6 text-left rounded-2xl border transition-all ${
                  state.artStyle === style.label 
                  ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20' 
                  : 'border-gray-200 bg-white hover:border-brand-orange/50'
                }`}
              >
                <div className="font-bold mb-1">{style.label}</div>
              </button>
            ))}
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STORYBOARD_TYPES.map((type, i) => (
                <button
                  key={i}
                  onClick={() => setState(prev => ({ ...prev, storyboardType: type.value }))}
                  className={`p-6 text-center rounded-2xl border transition-all ${
                    state.storyboardType === type.value 
                    ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20' 
                    : 'border-gray-200 bg-white hover:border-brand-orange/50'
                  }`}
                >
                  <div className="font-bold">{type.label}</div>
                </button>
              ))}
            </div>
            {state.storyboardType === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">ระบุจำนวนฉาก</label>
                <input
                  type="number"
                  value={state.customStoryboardFrames}
                  onChange={(e) => setState(prev => ({ ...prev, customStoryboardFrames: e.target.value }))}
                  className="w-full p-4 rounded-xl border border-gray-200"
                  min="1"
                  max="20"
                />
              </div>
            )}
          </div>
        );

      case 9:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Layout className="text-brand-orange" />
                ผลลัพธ์สตอรี่บอร์ดและพรอมต์
              </h3>
              <button 
                onClick={() => {
                  const allPrompts = state.generatedPrompts.map(p => `Scene ${p.sceneNumber}\nImage: ${p.imagePrompt}\nVideo: ${p.videoPrompt}\nDialogue: ${p.dialogue}`).join('\n\n');
                  copyToClipboard(allPrompts, 999);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                {copiedIndex === 999 ? <Check size={18} /> : <Copy size={18} />}
                คัดลอกทั้งหมด
              </button>
            </div>
            
            <div className="space-y-6">
              {state.generatedPrompts.map((scene, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                >
                  <div className="bg-brand-gray-light px-6 py-3 border-bottom border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-brand-orange">ฉากที่ {scene.sceneNumber}</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Image Prompt</span>
                        <button onClick={() => copyToClipboard(scene.imagePrompt, i * 2)} className="text-gray-400 hover:text-brand-orange">
                          {copiedIndex === i * 2 ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{scene.imagePrompt}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Video Prompt & Dialogue</span>
                        <button onClick={() => copyToClipboard(scene.videoPrompt + '\n' + scene.dialogue, i * 2 + 1)} className="text-gray-400 hover:text-brand-orange">
                          {copiedIndex === i * 2 + 1 ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2">{scene.videoPrompt}</p>
                      <p className="text-sm font-medium text-brand-gray-dark bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <span className="text-brand-orange font-bold">บทพูด:</span> {scene.dialogue}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TypeIcon className="text-brand-orange" />
              Viral Captions & Hashtags
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {state.captions.map((cap, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-orange-100 text-brand-orange text-xs font-bold rounded-full">{cap.type}</span>
                    <button onClick={() => copyToClipboard(cap.content, i + 500)} className="text-gray-400 hover:text-brand-orange">
                      {copiedIndex === i + 500 ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{cap.content}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">เลือกรูปแบบการส่งออก (PROMPT-TO-STORYBOARD)</h3>
            <div className="grid grid-cols-1 gap-4">
              {PROMPT_TO_STORYBOARD_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setState(prev => ({ ...prev, promptType: opt.value }))}
                  className={`p-6 text-left rounded-2xl border transition-all ${
                    state.promptType === opt.value 
                    ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20' 
                    : 'border-gray-200 bg-white hover:border-brand-orange/50'
                  }`}
                >
                  <div className="font-bold mb-1">{opt.label}</div>
                </button>
              ))}
            </div>
            {state.promptType && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-green-50 rounded-2xl border border-green-200 text-center">
                <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h4 className="text-lg font-bold text-green-800 mb-2">สร้างข้อมูลสำเร็จ!</h4>
                <p className="text-green-700">คุณสามารถคัดลอกพรอมต์ที่จัดรูปแบบแล้วไปใช้งานได้ทันที</p>
                <button 
                  onClick={() => setState(prev => ({ ...prev, step: 1, images: [], storySynopsis: '', generatedPrompts: [] }))}
                  className="mt-6 px-6 py-2 bg-brand-orange text-white rounded-xl hover:bg-orange-600"
                >
                  เริ่มใหม่
                </button>
              </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 orange-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={24} />
            </div>
            <h1 className="font-bold text-xl tracking-tight hidden sm:block">AI Storyboard Creator</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Step {state.step} of {STEPS.length}</span>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-orange transition-all duration-500" 
                style={{ width: `${(state.step / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Step Indicators */}
        <div className="hidden md:flex justify-between mb-12 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`step-indicator ${
                state.step === i + 1 ? 'step-active' : 
                state.step > i + 1 ? 'step-completed' : 'step-inactive'
              }`}>
                {state.step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                state.step === i + 1 ? 'text-brand-orange' : 'text-gray-400'
              }`}>{s}</span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="glass-card p-6 sm:p-10 min-h-[500px] flex flex-col">
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full space-y-4 py-20"
                >
                  <RefreshCw className="h-12 w-12 text-brand-orange animate-spin" />
                  <p className="text-lg font-medium text-gray-600">กำลังประมวลผลด้วย AI...</p>
                </motion.div>
              ) : (
                <div key={state.step}>
                  <h2 className="text-2xl font-bold text-brand-gray-dark mb-8 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg orange-gradient flex items-center justify-center text-white text-sm">
                      {state.step}
                    </span>
                    {STEPS[state.step - 1]}
                  </h2>
                  {renderStep()}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          {!loading && (
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
              <button
                onClick={prevStep}
                disabled={state.step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  state.step === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={20} />
                กลับ
              </button>
              <button
                onClick={nextStep}
                disabled={
                  (state.step === 2 && !state.selectedContent) ||
                  (state.step === 3 && !state.location) ||
                  (state.step === 4 && !state.languageStyle) ||
                  (state.step === 5 && !state.storytellingStyle) ||
                  (state.step === 6 && !state.cta) ||
                  (state.step === 7 && !state.artStyle) ||
                  (state.step === 8 && !state.storyboardType)
                }
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'orange-gradient hover:scale-105 active:scale-95'
                }`}
              >
                {state.step === 8 ? 'สร้างสตอรี่บอร์ด' : state.step === 11 ? 'เสร็จสิ้น' : 'ถัดไป'}
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Rules & Info Section (Footer) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-orange font-bold mb-3">
              <AlertCircle size={18} />
              กฎเหล็ก (Hard Rules)
            </div>
            <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
              <li>Face-Lock Consistency [VISUAL DNA] 100%</li>
              <li>Voice Profile [Voice DNA] 100%</li>
              <li>สัดส่วนสินค้า 1:1 เทียบกับตัวละคร</li>
              <li>ห้ามมีซับไตเติ้ลหรือข้อความในภาพ</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-orange font-bold mb-3">
              <Sparkles size={18} />
              เทคนิค AI
            </div>
            <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
              <li>ใช้ Forensic Artist วิเคราะห์ใบหน้า</li>
              <li>Motion Prompts ต้องเริ่มด้วย [VISUAL DNA]</li>
              <li>เน้น Skin Realism และ Natural Contrast</li>
              <li>Cinematic Lighting & Anamorphic Lens</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-orange font-bold mb-3">
              <Layout size={18} />
              โครงสร้างหลัก
            </div>
            <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
              <li>Hook (3 วินาทีแรก) หยุดนิ้วโป้ง</li>
              <li>Credibility สร้างความน่าเชื่อถือ</li>
              <li>Value มอบคุณค่าและประโยชน์</li>
              <li>CTA กระตุ้นการตัดสินใจ</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Floating Help Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 orange-gradient rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50">
        <Sparkles size={28} />
      </button>
    </div>
  );
}
