// 2D Collect Game (formerly ECS3DCollectGame)
import React, { useState } from 'react';
export default function CollectGame2D({ onComplete, onExit }: { onComplete: (score: number) => void; onExit: () => void }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  function handleCollect() {
    setScore(s => s + 1);
    setRound(r => r + 1);
  }
  function handleMiss() {
    setScore(s => Math.max(0, s - 1));
    setRound(r => r + 1);
  }
  function handleFinish() {
    setGameOver(true);
    if (onComplete) onComplete(score);
  }

  if (gameOver) return (
    <div style={{padding:40, textAlign:'center'}}>
      <h2 style={{fontSize:32, color:'#10b981'}}>Game Over!</h2>
      <p style={{fontSize:24}}>Final Score: {score}</p>
      <button onClick={onExit} style={{marginTop:24, fontSize:20, padding:'12px 32px', borderRadius:12, background:'#10b981', color:'#fff', border:'none'}}>Exit</button>
    </div>
  );

  return (
    <div style={{padding:40, textAlign:'center'}}>
      <h2 style={{fontSize:28, color:'#10b981'}}>Collect Game 2D</h2>
      <p style={{fontSize:20}}>Round {round} | Score: {score}</p>
      <div style={{margin:'32px 0'}}>
        <button onClick={handleCollect} style={{fontSize:18, marginRight:16, padding:'10px 24px', borderRadius:8, background:'#22c55e', color:'#fff', border:'none'}}>Collect</button>
        <button onClick={handleMiss} style={{fontSize:18, marginLeft:16, padding:'10px 24px', borderRadius:8, background:'#ef4444', color:'#fff', border:'none'}}>Miss</button>
      </div>
      {round < 6 ? (
        <button onClick={handleFinish} style={{fontSize:16, marginTop:16, padding:'8px 20px', borderRadius:8, background:'#f59e0b', color:'#fff', border:'none'}}>Finish Early</button>
      ) : (
        <button onClick={handleFinish} style={{fontSize:16, marginTop:16, padding:'8px 20px', borderRadius:8, background:'#f59e0b', color:'#fff', border:'none'}}>Finish Game</button>
      )}
    </div>
  );
}
