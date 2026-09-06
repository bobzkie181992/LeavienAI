import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Plus, Trash2, X, Play, BookOpen, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { useVideoLectures } from '../hooks/useFirebase';
import { Topic, VideoLecture } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface FacultyVideoManagerProps {
  topics: Topic[];
}

export default function FacultyVideoManager({ topics }: FacultyVideoManagerProps) {
  const { lectures, loading, addLecture, deleteLecture } = useVideoLectures();
  const [deletingVideo, setDeletingVideo] = useState<VideoLecture | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || 'limits');
  const [grade, setGrade] = useState('Grade 11');
  const [section, setSection] = useState('STEM-A');
  const [playingVideo, setPlayingVideo] = useState<VideoLecture | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeId) return;

    const matchedTopic = topics.find(t => t.id === selectedTopicId);
    const topicTitle = matchedTopic ? matchedTopic.title : 'Mathematics';

    await addLecture({
      title,
      description,
      youtubeId: youtubeId.trim(),
      topicId: selectedTopicId,
      topicTitle,
      grade,
      section
    });

    setTitle('');
    setDescription('');
    setYoutubeId('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white">
        <div>
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Faculty Video Lectures
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">Manage Curriculum Video Lectures</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Add custom video lectures for specific grade levels and sections. Students view the lecture before taking the connected quiz.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Video Lecture
        </button>
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lectures.map((lec) => (
          <div key={lec.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="relative aspect-video bg-slate-900">
                <img
                  src={`https://img.youtube.com/vi/${lec.youtubeId}/hqdefault.jpg`}
                  alt={lec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                    {lec.grade} • {lec.section}
                  </span>
                </div>

                <button
                  onClick={() => setPlayingVideo(lec)}
                  className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 pl-0.5">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </button>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{lec.topicTitle}</span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-black text-sm text-slate-900 line-clamp-1">{lec.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{lec.description}</p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-2">
              <button
                onClick={() => setPlayingVideo(lec)}
                className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Preview Lecture</span>
              </button>
              <button
                onClick={() => setDeletingVideo(lec)}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl transition-colors"
                title="Delete Lecture"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Lecture Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                <X className="w-6 h-6" />
              </button>

              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Video className="w-7 h-7 text-indigo-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">Add Video Lecture</h2>
              <p className="text-slate-500 mb-6 text-xs">Assign a YouTube video lecture for students before they take quizzes.</p>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Lecture Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Limits & Continuity Masterclass"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of what students will learn..."
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">YouTube Video ID</label>
                    <input
                      type="text"
                      required
                      value={youtubeId}
                      onChange={(e) => setYoutubeId(e.target.value)}
                      placeholder="e.g. kfokwixpHbs"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 ml-1 block">From youtube.com/watch?v=<strong>ID</strong></span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Curriculum Topic</label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Grade Level</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Section</label>
                    <input
                      type="text"
                      required
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. STEM-A"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all text-sm"
                >
                  Publish Lecture
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{playingVideo.topicTitle}</span>
                <h3 className="text-base font-black">{playingVideo.title}</h3>
              </div>
              <button onClick={() => setPlayingVideo(null)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black relative flex items-center justify-center">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playingVideo.youtubeId}?autoplay=1`}
                title={playingVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-6 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-700 leading-relaxed max-w-xl">{playingVideo.description}</p>
              <button
                onClick={() => setPlayingVideo(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors shrink-0"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingVideo}
        title="Delete Video Lecture"
        message={`Are you sure you want to delete "${deletingVideo?.title}"?`}
        confirmText="Delete Video"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!deletingVideo) return;
          setIsDeleting(true);
          try {
            await deleteLecture(deletingVideo.id);
          } finally {
            setIsDeleting(false);
            setDeletingVideo(null);
          }
        }}
        onClose={() => setDeletingVideo(null)}
      />
    </div>
  );
}
