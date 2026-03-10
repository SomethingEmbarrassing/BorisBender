(() => {

  const K = 0.33;

  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function r3(n) {
    if (!Number.isFinite(n)) return "—";
    return (Math.round(n * 1000) / 1000).toFixed(3);
  }

  function toTons(n) {
    if (!Number.isFinite(n)) return "—";
    return (Math.round(n * 10) / 10).toFixed(1);
  }

  function toNearestSixteenth(dec) {
    if (!Number.isFinite(dec)) return "—";

    const sign = dec < 0 ? "-" : "";
    dec = Math.abs(dec);

    let whole = Math.floor(dec);
    let frac = dec - whole;
    let n16 = Math.round(frac * 16);

    if (n16 === 16) {
      whole++;
      n16 = 0;
    }

    if (n16 === 0) return `${sign}${whole}"`;

    const g = gcd(n16, 16);
    const n = n16 / g;
    const d = 16 / g;

    if (whole === 0) return `${sign}${n}/${d}"`;
    return `${sign}${whole} ${n}/${d}"`;
  }

  function fillThicknessSelect(selectEl, defaultN16 = 4) {
    if (!selectEl) return;

    selectEl.innerHTML = "";

    for (let n16 = 1; n16 <= 16; n16++) {
      const opt = document.createElement("option");
      opt.value = (n16 / 16).toString();

      if (n16 === 16) {
        opt.textContent = '1"';
      } else {
        const g = gcd(n16, 16);
        opt.textContent = `${n16 / g}/${16 / g}"`;
      }

      if (n16 === defaultN16) opt.selected = true;
      selectEl.appendChild(opt);
    }
  }

  function formatFractionInches(dec) {
    const whole = Math.floor(dec);
    let frac = dec - whole;
    let n8 = Math.round(frac * 8);
    let w = whole;

    if (n8 === 8) {
      w++;
      n8 = 0;
    }

    if (n8 === 0) return `${w}"`;

    const g = gcd(n8, 8);
    const n = n8 / g;
    const d = 8 / g;

    if (w === 0) return `${n}/${d}"`;
    return `${w} ${n}/${d}"`;
  }

  function fillDieOpeningSelect(selectEl, defaultValue = 3) {
    if (!selectEl) return;

    selectEl.innerHTML = "";

    // 1/2" to 4" in 1/8" increments
    for (let eighths = 4; eighths <= 32; eighths++) {
      const value = eighths / 8;
      const opt = document.createElement("option");
      opt.value = value.toString();
      opt.textContent = formatFractionInches(value);

      if (Math.abs(value - defaultValue) < 0.00001) {
        opt.selected = true;
      }

      selectEl.appendChild(opt);
    }
  }

  function initBendPage() {
    const thk = $("thk");
    if (!thk) return;

    const dieOpening = $("dieOpening");
    const rin = $("rin");
    const adeg = $("adeg");
    const legA = $("legA");
    const legB = $("legB");
    const warn = $("warn");
    const ok = $("ok");

    fillThicknessSelect(thk, 4);
    fillDieOpeningSelect(dieOpening, 2);

    function calc() {
      if (warn) {
        warn.hidden = true;
        warn.textContent = "";
      }
      if (ok) ok.hidden = true;

      const T = Number(thk.value);
      const deg = Math.round(Number(adeg.value));
      const A = Number(legA.value);
      const B = Number(legB.value);

      const R = T;
      if (rin) rin.value = r3(R);

      const problems = [];
      if (!(T > 0)) problems.push("Thickness must be > 0.");
      if (!(deg > 0 && deg < 180)) problems.push("Angle must be 1–179 degrees.");
      if (!(A >= 0)) problems.push("Leg A must be ≥ 0.");
      if (!(B >= 0)) problems.push("Leg B must be ≥ 0.");

      if (Number.isFinite(deg)) adeg.value = deg;

      const angleRad = deg * Math.PI / 180;
      const OSSB = (R + T) * Math.tan((deg / 2) * Math.PI / 180);
      const neutralRadius = R + (K * T);
      const BA = angleRad * neutralRadius;
      const BD = (2 * OSSB) - BA;
      const flat = A + B - BD;

      if ($("angleRad")) $("angleRad").textContent = r3(angleRad);
      if ($("ossb")) $("ossb").textContent = r3(OSSB);
      if ($("neutralR")) $("neutralR").textContent = r3(neutralRadius);
      if ($("ba")) $("ba").textContent = r3(BA);
      if ($("bd")) $("bd").textContent = r3(BD);
      if ($("flatDec")) $("flatDec").textContent = r3(flat);
      if ($("flatFrac")) $("flatFrac").textContent = toNearestSixteenth(flat);

      const borisFlat = $("borisFlat");
      if (borisFlat) borisFlat.textContent = toNearestSixteenth(flat);

      if (problems.length) {
        if (warn) {
          warn.textContent = problems.join(" ");
          warn.hidden = false;
        }
        return;
      }

      if (ok) ok.hidden = false;
    }

    [thk, dieOpening, adeg, legA, legB].forEach(el => {
      if (!el) return;
      el.addEventListener("input", calc);
      el.addEventListener("change", calc);
    });

    calc();
  }

  function initTonnagePage() {
    const t_thk = $("t_thk");
    if (!t_thk) return;

    const t_material = $("t_material");
    const t_len = $("t_len");
    const t_dieOpening = $("t_dieOpening");
    const tpf = $("t_tpf");
    const total = $("t_total");
    const matFactorOut = $("t_matFactor");
    const borisAnswer = $("borisAnswer");
    const borisImg = $("borisImg");

    fillThicknessSelect(t_thk, 6);         // default 3/8"
    fillDieOpeningSelect(t_dieOpening, 3); // default 3"

    function calc() {
      const T = Number(t_thk.value);
      const L = Number(t_len.value);
      const V = Number(t_dieOpening.value);
      const matFactor = Number(t_material?.value ?? 1);

      if (!(T > 0) || !(L > 0) || !(V > 0) || !(matFactor > 0)) {
        if (tpf) tpf.textContent = "—";
        if (total) total.textContent = "—";
        if (matFactorOut) matFactorOut.textContent = "—";

        if (borisAnswer) {
          borisAnswer.textContent = "—";
          borisAnswer.className = "borisAnswer";
        }

        if (borisImg) {
          borisImg.src = "";
        }

        return;
      }

      // Base formula assumes mild steel baseline
      const baseTonsPerFoot = (575 * T * T) / V;
      const tonsPerFoot = baseTonsPerFoot * matFactor;
      const totalTons = tonsPerFoot * (L / 12);

      if (tpf) tpf.textContent = `${toTons(tonsPerFoot)} tons/ft`;
      if (total) total.textContent = `${toTons(totalTons)} tons`;
      if (matFactorOut) matFactorOut.textContent = `${matFactor.toFixed(2)}×`;

      if (borisAnswer) {
        if (totalTons > 200) {
          borisAnswer.textContent = `NO — Over 200 tons (${toTons(totalTons)})`;
          borisAnswer.className = "borisAnswer overLimit";
        } else {
          borisAnswer.textContent = `YES — Under 200 tons (${toTons(totalTons)})`;
          borisAnswer.className = "borisAnswer underLimit";
        }
      }

      if (borisImg) {
        if (totalTons > 200) {
          borisImg.src = "https://raw.githubusercontent.com/SomethingEmbarrassing/BorisBender/main/Boris%20failed.png";
        } else {
          borisImg.src = "https://raw.githubusercontent.com/SomethingEmbarrassing/BorisBender/main/Boris%20cleaned%20up.png";
        }
      }
    }

    [t_thk, t_material, t_len, t_dieOpening].forEach(el => {
      if (!el) return;
      el.addEventListener("input", calc);
      el.addEventListener("change", calc);
    });

    calc();
  }

  initBendPage();
  initTonnagePage();

})();
