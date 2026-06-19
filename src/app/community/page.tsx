"use client";

import { useState, useEffect } from "react";
import { getPosts, addPost, toggleLike, addComment, subscribe } from "@/lib/store";

export default function CommunityPage() {
  const [posts, setPosts] = useState(getPosts());
  const [newPost, setNewPost] = useState("");
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  useEffect(() => subscribe(() => setPosts([...getPosts()])), []);

  const handleCreate = () => {
    if (!newPost.trim()) return;
    addPost({ author: "匿名用户", content: newPost.trim() });
    setNewPost("");
  };

  const handleComment = (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    addComment(postId, text, "匿名用户");
    setCommentTexts(prev => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-20">
      <div className="text-center mb-8">
        <span className="text-4xl mb-3 block">💬</span>
        <h1 className="text-2xl font-black text-mystic-100 font-serif mb-2">命理社区</h1>
        <p className="text-mystic-500 text-sm">分享命盘，交流探讨</p>
      </div>

      <div className="card-mystic p-4 mb-6">
        <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
          placeholder="分享你的命盘心得..." className="input-mystic min-h-[80px] resize-none mb-3" />
        <button onClick={handleCreate} disabled={!newPost.trim()} className="btn-primary w-full">发布</button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="card-mystic p-12 text-center text-mystic-500">
            <p className="text-4xl mb-3">🌙</p><p>还没有帖子，来发第一条吧！</p>
          </div>
        )}
        {(posts as any[]).map((post: any) => (
          <div key={post.id} className="card-mystic p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-mystic-700 flex items-center justify-center text-sm">👤</div>
              <div>
                <p className="text-sm font-medium text-mystic-300">{post.author}</p>
                <p className="text-xs text-mystic-600">{new Date(post.createdAt).toLocaleString("zh-CN")}</p>
              </div>
            </div>
            <p className="text-mystic-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center gap-4 text-xs text-mystic-500">
              <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1 hover:text-mystic-300">❤️ {post.likes || 0}</button>
              <span>💬 {post.comments?.length || 0}</span>
            </div>
            {post.comments?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-mystic-800/30 space-y-2">
                {post.comments.map((c: any) => (
                  <div key={c.id} className="text-xs">
                    <span className="text-mystic-400 font-medium">{c.author}</span>
                    <span className="text-mystic-600 mx-1">·</span>
                    <span className="text-mystic-500">{c.text}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <input type="text" value={commentTexts[post.id] || ""}
                onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                placeholder="写评论..." className="input-mystic flex-1 text-xs py-2"
                onKeyDown={e => e.key === "Enter" && handleComment(post.id)} />
              <button onClick={() => handleComment(post.id)} className="text-xs text-mystic-400 hover:text-mystic-200 px-2">发送</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
