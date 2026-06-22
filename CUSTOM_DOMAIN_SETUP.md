# 🌐 Custom Domain Setup Guide

## ✅ RECOMMENDED: Buy nexusrevive.com ($10/year)

### Why You Need It:
- ❌ `nexus-revive.vercel.app` - Looks unprofessional
- ✅ `nexusrevive.com` - Professional, trustworthy, brandable

---

## 💰 Cheapest Options:

### Option 1: Namecheap ($8.88 first year)
1. Go to https://www.namecheap.com
2. Search: `nexusrevive`
3. Add to cart
4. Use promo code: NEWCOM598 (often works for ~$6)
5. Checkout

### Option 2: Porkbun ($8.13/year)
- https://porkbun.com
- Search and buy `nexusrevive.com`

### Option 3: Cloudflare ($9.77/year)
- https://www.cloudflare.com/products/registrar
- At-cost pricing, no markup

---

## 🔧 Connect Domain to Vercel (5 Minutes):

### Step 1: Add Domain in Vercel
1. Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `nexusrevive.com`
4. Click "Add"
5. Repeat for: `www.nexusrevive.com`

### Step 2: Configure DNS (In Namecheap or your registrar)

Go to: Domain List → Manage → Advanced DNS

Add these records:

```
Type: A Record
Host: @
Value: 76.76.19.19
TTL: Automatic
```

```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

### Step 3: Update Vercel Environment Variables

Go to: Settings → Environment Variables → Edit each:

```
NEXTAUTH_URL=https://nexusrevive.com
NEXT_PUBLIC_APP_URL=https://nexusrevive.com
```

Select: All Environments

### Step 4: Wait (10 minutes - 24 hours)
- DNS propagation time
- Vercel will auto-configure SSL
- Check status in Vercel Domains tab

---

## ✅ Verification:

Visit: https://nexusrevive.com
- Should show your app
- HTTPS/SSL automatic
- www redirects to main domain

---

## 🆓 FREE Alternatives (Less Professional):

### Freenom (Free .tk, .ml, .ga domains)
- Site: https://www.freenom.com
- Example: nexusrevive.tk
- ⚠️ Warning: Less trustworthy for business

### InfinityFree Subdomain
- Free hosting + subdomain
- Not recommended for production

---

## 💡 BOTTOM LINE:

**Spend $10 on .com domain NOW**

Why?
- 1 Pro customer ($4.99) = pays for domain
- Professional appearance = more customers
- Can't build serious business on .vercel.app
- Domain is cheapest part of running SaaS

**Don't let $10 stop you from launching a real business!**

---

## 🚀 Current Status:

UNTIL you buy domain, use:
```
NEXTAUTH_URL=https://nexus-revive.vercel.app
NEXT_PUBLIC_APP_URL=https://nexus-revive.vercel.app
```

But upgrade to .com ASAP for credibility!
