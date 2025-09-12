# Authentication System (Fake Mode)

Bu proje için giriş/çıkış fonksiyonları **fake authentication** ile eklenmiştir. Backend bağlantısı gerektirmez.

## Özellikler

- ✅ Kullanıcı girişi (login) - Fake authentication
- ✅ Kullanıcı çıkışı (logout)
- ✅ LocalStorage'da kullanıcı bilgisi saklama
- ✅ Korumalı rotalar
- ✅ Kullanıcı menüsü
- ✅ Responsive tasarım
- ✅ Backend bağımlılığı yok

## Kurulum

1. Frontend'i başlatın: `npm run dev` veya `pnpm dev`

## Kullanım

### Giriş Yapma
- Uygulama açıldığında otomatik olarak giriş sayfası görüntülenir
- Aşağıdaki demo hesaplardan birini kullanın
- Başarılı girişten sonra ana dashboard'a yönlendirilirsiniz

### Çıkış Yapma
- Sağ üst köşedeki kullanıcı avatar'ına tıklayın
- "Çıkış Yap" seçeneğini seçin
- Otomatik olarak giriş sayfasına yönlendirilirsiniz

## Demo Hesaplar

Test için kullanabileceğiniz demo hesap bilgileri:

### Admin Hesabı
- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin123`
- **Rol:** Admin
- **Erişim:** Tüm özellikler

### User Hesabı
- **Kullanıcı Adı:** `user`
- **Şifre:** `user123`
- **Rol:** User
- **Erişim:** Sınırlı özellikler

## Dosya Yapısı

```
frontend/
├── components/auth/
│   ├── login-form.tsx      # Giriş formu
│   ├── protected-route.tsx # Korumalı rota wrapper'ı
│   └── user-menu.tsx       # Kullanıcı menüsü
├── contexts/
│   └── auth-context.tsx    # Fake kimlik doğrulama context'i
└── lib/
    └── config.ts           # Konfigürasyon dosyası
```

## Güvenlik

- **Fake authentication** - Gerçek güvenlik yok
- LocalStorage'da kullanıcı bilgisi saklama
- Korumalı rota erişimi (frontend seviyesinde)
- **Not:** Bu sadece demo amaçlıdır, production'da kullanmayın

## Özelleştirme

### Yeni Demo Hesap Ekleme
`frontend/contexts/auth-context.tsx` dosyasında `login` fonksiyonuna yeni credentials ekleyin.

### Stil Değişiklikleri
`frontend/components/auth/login-form.tsx` dosyasında CSS sınıflarını düzenleyin.

### Dil Değişiklikleri
Tüm metinler Türkçe olarak yazılmıştır. İngilizce yapmak için ilgili dosyalardaki metinleri güncelleyin.

## Production'a Geçiş

Gerçek backend'e geçmek için:
1. `frontend/contexts/auth-context.tsx` dosyasını gerçek API çağrıları ile güncelleyin
2. `frontend/app/api/auth/` klasörünü geri ekleyin
3. `frontend/lib/config.ts` dosyasında backend URL'ini ayarlayın
