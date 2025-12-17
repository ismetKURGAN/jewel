import React from 'react';

const Header = ({ onSearch, onAdd }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark px-2 py-4 sm:px-4">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-text-primary-dark">
          <div className="size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">Kuyumcu Envanteri</h2>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <label className="flex flex-col min-w-40 !h-10 max-w-sm w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-text-secondary-dark flex bg-surface-dark items-center justify-center pl-3 rounded-l-lg">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input 
              onChange={(e) => onSearch(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary-dark focus:outline-0 focus:ring-0 border-none bg-surface-dark focus:border-none h-full placeholder:text-text-secondary-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
              placeholder="Ad veya stok koduna göre ara..." 
            />
          </div>
        </label>
        <button 
          onClick={onAdd}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="truncate hidden sm:block">Yeni Çift Ekle</span>
        </button>
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAlIvDH5HZBibAiuhZK34-TLu8eU_ipiQ8n4bKFKB2Wr7zxFs2qTQtOwT9hB0EUF4uxnCm4mrN5cevlxqayZRl4E8eQzUDbX5TdqowFKE-kMDTEia8SvqxeCnxGzHWWh7RaGCq-P_7Q6Ne34-TY3sSievHt0rz_M520wyNFtQM6pC8EqYkU05XaDn0N4C7ptmRAAYCAH4eyog8ChM_wVlL_k4PDtJ8RgaUKn9EQt7cdqyT2AgwotAA6IpI0RfcvnFzPQGeMBbTBQng")'}}></div>
      </div>
    </header>
  );
};

export default Header;
