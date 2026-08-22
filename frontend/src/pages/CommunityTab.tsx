import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MessageSquare, Plus, X, Image as ImageIcon, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function CommunityTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [search, sort, categoryFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/community/posts', {
        params: { search, sort, category: categoryFilter }
      });
      setPosts(res.data);
    } catch (error) {
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setSubmitting(true);
    try {
      await axios.post(
        'http://localhost:5000/api/community/posts',
        { content: newPostContent, image_url: newPostImage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Post created successfully!');
      setIsModalOpen(false);
      setNewPostContent('');
      setNewPostImage('');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/community/posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header and Controls */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <MessageSquare className="mr-3 text-indigo-500 h-8 w-8" />
            Community
          </h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 block w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
              >
                <option value="">All Categories</option>
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food">Food</option>
                <option value="Culture">Culture</option>
                <option value="Adventure">Adventure</option>
                <option value="Leisure">Leisure</option>
              </select>
            </div>
            <div className="flex-1 md:w-40">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="block w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No posts found</h3>
          <p className="mt-1 text-slate-500">Be the first to share your travel experience!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {post.user.profile_photo_url ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={post.user.profile_photo_url} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {post.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{post.user.name}</p>
                      <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(post.created_at))} ago</p>
                    </div>
                  </div>
                  
                  {/* Delete Button (Owner or Admin) */}
                  {(user?.id === post.user_id || user?.role === 'ADMIN') && (
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Post"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-slate-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {post.image_url && (
                  <div className="mt-4 rounded-xl overflow-hidden max-h-96">
                    <img src={post.image_url} alt="Post attachment" className="w-full h-full object-cover" />
                  </div>
                )}
                
                {post.activity && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <MapPin className="mr-1.5 h-3 w-3" />
                    {post.activity.name} • {post.activity.city?.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Create Post</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="p-6">
              <div className="space-y-4">
                <div>
                  <textarea
                    rows={4}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your travel experience or ask a question..."
                    className="block w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    required
                  />
                </div>
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="url"
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      placeholder="Image URL (optional)"
                      className="pl-10 block w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newPostContent.trim()}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
