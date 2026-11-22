/*! Eretek Online Araçlar #08 — VLAN ID ve Trunk Listesi Düzenleyici */
ERT.def('08', {
	run: function (v, c) {
		var parse = function (s, f) {
			var set = new Set();
			String(s || '').split(/[,\s;]+/).filter(Boolean).forEach(function (t) {
				var m = /^(\d+)(?:-(\d+))?$/.exec(t);
				if (!m) { throw c.fe(f, 'badTok', { t: t }); }
				var a = +m[1], b = m[2] ? +m[2] : a;
				if (a < 1 || b > 4094 || a > b) { throw c.fe(f, 'range', { t: t }); }
				for (var i = a; i <= b; i++) { set.add(i); }
			});
			return set;
		};
		var fmt = function (set) {
			var a = Array.from(set).sort(function (x, y) { return x - y; }), o = [], i = 0;
			while (i < a.length) { var s = a[i], e = s; while (a[i + 1] === e + 1) { i++; e = a[i]; } o.push(s === e ? String(s) : s + '-' + e); i++; }
			return o.join(',');
		};
		var A = parse(v.a, 'a'), B = v.b ? parse(v.b, 'b') : null;
		var kv = [[c.t('normA'), fmt(A) || '–'], [c.t('cntA'), A.size]], msgs = [], vv = { a: fmt(A) };
		var nat = function (x, f) { if (x === null || x === undefined || x === '') { return null; } if (!(x >= 1 && x <= 4094) || Math.floor(x) !== x) { throw c.fe(f, 'range', { t: x }); } return x; };
		var na = nat(v.na, 'na'), nb = nat(v.nb, 'nb');
		if (B) {
			var com = new Set(Array.from(A).filter(function (x) { return B.has(x); })), oa = new Set(Array.from(A).filter(function (x) { return !B.has(x); })), ob = new Set(Array.from(B).filter(function (x) { return !A.has(x); }));
			kv.push([c.t('normB'), fmt(B) || '–'], [c.t('cntB'), B.size], [c.t('common'), fmt(com) || '–'], [c.t('onlyA'), fmt(oa) || '–'], [c.t('onlyB'), fmt(ob) || '–']);
			msgs.push(oa.size || ob.size ? ['warn', c.t('diff', { a: oa.size, b: ob.size })] : ['ok', c.t('same')]);
			vv.b = fmt(B); vv.common = fmt(com); vv.onlyA = fmt(oa); vv.onlyB = fmt(ob);
		}
		if (na !== null && nb !== null) { if (na !== nb) { msgs.push(['err', c.t('natMis', { a: na, b: nb })]); vv.nativeMismatch = true; } else { msgs.push(['ok', c.t('natOk', { a: na })]); vv.nativeMismatch = false; } }
		if (na !== null && !A.has(na)) { msgs.push(['info', c.t('natNotA', { n: na })]); }
		if (B && nb !== null && !B.has(nb)) { msgs.push(['info', c.t('natNotB', { n: nb })]); }
		return { big: fmt(A) || '–', kv: kv, msgs: msgs, x: { copy: kv.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') }, v: vv };
	}
});
