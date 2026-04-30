'use client'

import { useEffect } from 'react'

export default function SeoAuditPage() {
  useEffect(() => {
    // Inject SEOptimer CSS
    const style = document.createElement('style')
    style.textContent = `
      #so-form { margin: 10px!important; }
      #so-fieldswrapso1777575228 { width: 300px!important; }
      .so-fieldso1777575228 {
        background-color: #FFFFFF!important;
        border: 1px solid #dbdfe9!important;
        border-radius: 4px !important;
        color: #4b5675!important;
        padding: 7px 12px!important;
        font-size: 18px!important;
        box-sizing: border-box !important;
        height: 38px!important;
        width: 100%!important;
        display: block!important;
        margin-top: 5px!important;
      }
      .so-fieldso1777575228::placeholder { color: #99a1b7!important; }
      #so-submitso1777575228 {
        background-color: #e4be61!important;
        border: 1px solid #e4be61!important;
        color: #ffffff!important;
        border-radius: 4px !important;
        cursor: pointer!important;
        box-sizing: border-box !important;
        height: 38px!important;
        font-size: 18px!important;
        line-height: 18px!important;
        display: block!important;
        padding: 5px 30px!important;
        margin-top: 5px!important;
      }
      .so-container { width: 100%; text-align: center; }
      .so-widget-form { display: inline-block !important; }
      #so-boxso1777575228 { display: inline-block; }
      #so-titleso1777575228 {
        margin-bottom: 5px;
        font-size: 26px !important;
        color: #252f4a !important;
      }
      @media screen and (max-width: 500px) {
        .so-fieldso1777575228 { font-size: 12px !important; height: 30px !important; }
        #so-submitso1777575228 { font-size: 12px !important; height: 30px; padding: 1px 20px !important; }
        #so-fieldswrapso1777575228 { width: 100%; }
        #so-titleso1777575228 { font-size: 13px !important; }
      }
    `
    document.head.appendChild(style)

    // Inject SEOptimer JavaScript
    const script = document.createElement('script')
    script.textContent = `
      function soSubmit(el) {
        if (!soFormValidate(el)) return false;
        const behaviour = el.getAttribute('data-behaviour');
        soBody = document.getElementsByTagName("body")[0];
        soBodyOriginalStyleHeight = soBody.style.height;
        soBodyOriginalStyleOverflow = soBody.style.overflow;
        const element = document.createElement("input");
        element.setAttribute("type", "hidden");
        element.setAttribute("name", "referrer");
        element.setAttribute("value", window.location.href);
        el.appendChild(element);
        if (behaviour == 'new_tab') return true;
        if (behaviour == 'be_in_touch') return soSubmitBeInTouch(el);
        if (behaviour == 'redirect') return soSubmitRedirect(el);
      }

      function soFormValidate(el) {
        const domain = el.querySelector('input[name="domain"]');
        const email = el.querySelector('input[name="email"]');
        const phone = el.querySelector('input[name="phone"]');
        const firstName = el.querySelector('input[name="first_name"]');
        if (0 == domain.value.length) return alert(domain.getAttribute("data-validation")), !1;
        if (domain.value = domain.value.trim().replace(/\\/$/, ""),
          !domain.value.match(/^(https?:\\/\\/)?[a-z\\d\\-]{1,62}\\.[a-z\\d\\-]{1,62}(\\.[a-z\\d\\-]{1,62})*$/i))
          return alert(domain.getAttribute("data-validation")), !1;
        if (null != firstName && 0 == firstName.value.length)
          return alert(firstName.getAttribute("data-validation")), !1;
        if (null != email) {
          if (0 == email.value.length) return alert(email.getAttribute("data-validation")), !1;
          const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/i;
          if (!regex.test(email.value)) return alert(email.getAttribute("data-validation")), !1;
        }
        if (null != phone && 7 > phone.value.length)
          return alert(phone.getAttribute("data-validation")), !1;
        setTimeout(function () { el.reset(); }, 50);
        return true;
      }

      function soSubmitBeInTouch(el) {
        const iframe = document.createElement("iframe");
        const element = document.createElement("input");
        element.setAttribute("type", "hidden");
        element.setAttribute("name", "be_in_touch");
        element.setAttribute("value", "1");
        el.appendChild(element);
        iframe.setAttribute('id', 'so-iframe');
        iframe.setAttribute('name', 'so-iframe');
        iframe.setAttribute('style', 'position:absolute; bottom:0; left:0; width:1px; height:1px; border:none');
        document.body.appendChild(iframe);
        alert(el.getAttribute("data-touch"));
        return true;
      }

      function soSubmitRedirect(el) { el.removeAttribute('target'); return true; }
    `
    document.body.appendChild(script)

    return () => {
      if (style.parentNode) style.parentNode.removeChild(style)
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  return (
    <main className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Free SEO Audit</h1>
        <p className="text-gray-600">
          Enter your website URL below to get a full SEO report instantly.
        </p>
      </div>

      <div className="so-container">
        <div id="so-boxso1777575228">
          <div id="so-titleso1777575228">Audit Your Website&apos;s SEO Now!</div>
          <form
            className="so-widget-form"
            id="so1777575228"
            action="https://seo.mnmagency.com/process-embedded.inc"
            target="so-iframe"
            data-behaviour="be_in_touch"
            data-title="Website Report for "
            data-touch="The report will be sent to your email shortly. Thank you!"
            onSubmit={(e) => {
              e.preventDefault()
              const win = window as unknown as { soSubmit: (el: HTMLFormElement) => boolean }
              win.soSubmit(e.currentTarget)
            }}
          >
            <input id="so-typeso1777575228" type="hidden" name="type" value="pdf" />
            <input type="hidden" name="uid" value="89271" />
            <input type="hidden" name="csrf_token" value="be97f0368c0bb95b44c0883324bfa7f436cacae1" />
            <input type="hidden" name="behaviour" value="be_in_touch" />
            <input type="hidden" name="template" value="0" />
            <div id="so-fieldswrapso1777575228">
              <input type="text" name="domain" id="so-domainso1777575228"
                className="so-fieldso1777575228" placeholder="Website URL"
                data-validation="Please enter a correct Website URL." />
              <input type="text" name="first_name" id="so-first-nameso1777575228"
                className="so-fieldso1777575228" placeholder="First Name"
                data-validation="Please enter your First Name" />
              <input type="text" name="email" id="so-emailso1777575228"
                className="so-fieldso1777575228" placeholder="Email"
                data-validation="Please enter a valid email address." />
              <input type="text" name="phone" id="so-phoneso1777575228"
                className="so-fieldso1777575228" placeholder="Phone Number"
                data-validation="Please enter a valid phone number" />
              <input type="submit" id="so-submitso1777575228" value="Check" />
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
