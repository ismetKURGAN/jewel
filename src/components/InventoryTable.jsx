import React from 'react';

const InventoryTable = ({ items, onDelete }) => {
  const checkboxTickSvg = "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(16,29,34)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')";

  // Para birimi formatlayıcı
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Başlık Alanı */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-2">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em]">Eşleşen Ürün Yönetimi</h1>
          <p className="text-text-secondary-dark text-base font-normal leading-normal">Eşleşen takı öğelerinizi ve setlerinizi verimli bir şekilde yönetin.</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark pl-4 pr-3 text-text-primary-dark">
            <p className="text-sm font-medium leading-normal">Tüm Kategoriler</p>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark pl-4 pr-3 text-text-primary-dark">
            <p className="text-sm font-medium leading-normal">Stokta</p>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark px-4 text-text-primary-dark">
            <p className="text-sm font-medium leading-normal">Alyans Setleri</p>
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark/60 px-4 text-text-secondary-dark">
            <p className="text-sm font-medium leading-normal">Kolye & Küpe</p>
          </button>
        </div>
        <div>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark px-4 text-text-primary-dark">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <p className="text-sm font-medium leading-normal">Filtreler</p>
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="px-2 py-3">
        <div className="flex overflow-hidden rounded-lg border border-border-dark bg-background-dark overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-dark">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input 
                    className="h-5 w-5 rounded border-border-dark border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:border-border-dark focus:outline-none" 
                    style={{ '--checkbox-tick-svg': checkboxTickSvg }}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3 text-left text-text-primary-dark text-sm font-medium leading-normal" colSpan="2">Çift Adı</th>
                <th className="px-4 py-3 text-left text-text-primary-dark text-sm font-medium leading-normal">Stok Kodu</th>
                <th className="px-4 py-3 text-left text-text-primary-dark text-sm font-medium leading-normal">Setteki Miktar</th>
                <th className="px-4 py-3 text-left text-text-primary-dark text-sm font-medium leading-normal">Toplam Fiyat</th>
                <th className="px-4 py-3 text-left text-text-primary-dark text-sm font-medium leading-normal">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-secondary-dark">
                    Ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-t-border-dark hover:bg-surface-dark/30 transition-colors">
                    <td className="h-[72px] px-4 py-2">
                      <input 
                        className="h-5 w-5 rounded border-border-dark border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:border-border-dark focus:outline-none" 
                        style={{ '--checkbox-tick-svg': checkboxTickSvg }}
                        type="checkbox"
                      />
                    </td>
                    <td className="h-[72px] py-2 w-16">
                      <div 
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-md w-12 h-12 border border-border-dark/50" 
                        style={{backgroundImage: `url("${item.image}")`}}
                      ></div>
                    </td>
                    <td className="h-[72px] px-4 py-2 text-text-primary-dark text-sm font-medium leading-normal">
                      {item.name}
                    </td>
                    <td className="h-[72px] px-4 py-2 text-text-secondary-dark text-sm font-normal leading-normal">
                      {item.sku}
                    </td>
                    <td className="h-[72px] px-4 py-2 text-text-secondary-dark text-sm font-normal leading-normal">
                      {item.quantity}
                    </td>
                    <td className="h-[72px] px-4 py-2 text-text-primary-dark text-sm font-medium leading-normal">
                      {formatter.format(item.price)}
                    </td>
                    <td className="h-[72px] px-4 py-2 text-text-secondary-dark">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onEdit(item)}
                          className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-dark hover:text-primary transition-colors" 
                          title="Ürünü Düzenle"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="flex size-8 items-center justify-center rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors" 
                          title="Ürünü Sil"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama (Şimdilik Statik) */}
      <div className="flex items-center justify-between p-4 border-t border-border-dark mt-4">
        <p className="text-sm text-text-secondary-dark">Topam {items.length} ürün</p>
        <div className="flex items-center justify-center">
          <a className="flex size-10 items-center justify-center text-text-secondary-dark cursor-not-allowed opacity-50" href="#">
            <span className="material-symbols-outlined">chevron_left</span>
          </a>
          <a className="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-text-primary-dark rounded-full bg-surface-dark" href="#">1</a>
          <a className="flex size-10 items-center justify-center text-text-primary-dark" href="#">
            <span className="material-symbols-outlined">chevron_right</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
