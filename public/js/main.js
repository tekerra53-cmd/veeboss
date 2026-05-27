document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggleButton && mobileNav) {
    toggleButton.addEventListener("click", function () {
      const expanded = toggleButton.getAttribute("aria-expanded") === "true";
      mobileNav.classList.toggle("hidden");
      toggleButton.setAttribute("aria-expanded", String(!expanded));
    });
  }

  const sectionLinks = document.querySelectorAll("[data-section-link]");
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  function updateActiveSection() {
    let activeId = "";
    const threshold = window.innerHeight * 0.35;
    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= threshold && rect.bottom >= threshold) {
        activeId = section.id;
      }
    });

    sectionLinks.forEach(function (link) {
      if (link.dataset.sectionLink === activeId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  if (sections.length > 0) {
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
  }

  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  const heroImage = document.querySelector("#home img");
  if (heroImage) {
    window.addEventListener(
      "scroll",
      function () {
        const offset = window.scrollY * 0.15;
        heroImage.style.transform = `translateY(${offset}px) scale(1.02)`;
      },
      { passive: true }
    );
  }

  const adminTabs = document.querySelectorAll("[data-admin-tab]");
  const adminPanels = document.querySelectorAll("[data-admin-panel]");
  if (adminTabs.length && adminPanels.length) {
    adminTabs.forEach(function (button) {
      button.addEventListener("click", function () {
        adminTabs.forEach(function (item) {
          item.classList.remove("bg-white", "text-black");
          item.classList.add("border", "border-white/20", "bg-transparent", "text-zinc-200");
        });
        button.classList.add("bg-white", "text-black");
        button.classList.remove("border", "border-white/20", "bg-transparent", "text-zinc-200");
        const key = button.dataset.adminTab;
        adminPanels.forEach(function (panel) {
          if (panel.dataset.adminPanel === key) {
            panel.classList.remove("hidden");
          } else {
            panel.classList.add("hidden");
          }
        });
      });
    });
  }

  const saveStatus = document.getElementById("admin-save-status");
  const serviceList = document.getElementById("service-list");
  const processList = document.getElementById("process-list");
  const collectionItemList = document.getElementById("collection-item-list");
  let saveTimer = null;
  let savePending = false;
  const SAVE_DEBOUNCE_MS = 1100;

  function setSaveStatus(message, isError) {
    if (!saveStatus) return;
    saveStatus.textContent = message;
    saveStatus.classList.toggle("text-red-300", Boolean(isError));
    saveStatus.classList.toggle("text-emerald-300", !isError);
  }

  function scheduleSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    savePending = true;
    setSaveStatus("Saving changes…", false);
    saveTimer = setTimeout(async function () {
      saveTimer = null;
      const payload = gatherAdminContent();
      const success = await saveContent(payload);
      savePending = false;
      if (success) {
        setSaveStatus("Saved automatically.", false);
      }
    }, SAVE_DEBOUNCE_MS);
  }

  function getFieldValue(name, root = document) {
    const field = root.querySelector(`[data-field="${name}"]`);
    return field ? field.value : "";
  }

  function gatherAdminContent() {
    return {
      heroSubtitle: getFieldValue("heroSubtitle"),
      heroDescription: getFieldValue("heroDescription"),
      services: serviceList
        ? Array.from(serviceList.querySelectorAll("[data-service-item]")).map(function (item) {
            return {
              title: item.querySelector("[data-field='service-title']")?.value || "",
              description: item.querySelector("[data-field='service-description']")?.value || "",
            };
          })
        : [],
      aboutNarrative: getFieldValue("aboutNarrative"),
      contactEmail: getFieldValue("contactEmail"),
      contactWhatsapp: getFieldValue("contactWhatsapp"),
      contactLocation: getFieldValue("contactLocation"),
      contactIntro: getFieldValue("contactIntro"),
      socialInstagram: getFieldValue("socialInstagram"),
      socialTikTok: getFieldValue("socialTikTok"),
      socialPinterest: getFieldValue("socialPinterest"),
      process: processList
        ? Array.from(processList.querySelectorAll("[data-process-item]")).map(function (item) {
            return {
              step: item.querySelector("[data-field='process-step']")?.value || "",
              title: item.querySelector("[data-field='process-title']")?.value || "",
              detail: item.querySelector("[data-field='process-detail']")?.value || "",
            };
          })
        : [],
      collections: collectionItemList
        ? Array.from(collectionItemList.querySelectorAll("[data-collection-item]")).map(function (item) {
            return {
              id: item.querySelector("[data-field='collection-id']")?.value || `collection-${Date.now()}`,
              name: item.querySelector("[data-field='collection-name']")?.value || "",
              season: item.querySelector("[data-field='collection-season']")?.value || "",
              image: item.querySelector("[data-field='collection-image']")?.value || "",
              note: item.querySelector("[data-field='collection-note']")?.value || "",
              medium: item.querySelector("[data-field='collection-medium']")?.value || "",
            };
          })
        : [],
    };
  }

  async function saveContent(data) {
    setSaveStatus("Saving...", false);

    try {
      const response = await fetch("/admin/save", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        return true;
      }
      setSaveStatus(result.error || "Save failed.", true);
      return false;
    } catch (error) {
      setSaveStatus("Save failed. Check your network.", true);
      return false;
    }
  }

  function swapListItem(item, offset) {
    if (!item || !item.parentElement) return;
    const parent = item.parentElement;
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(item);
    const targetIndex = index + offset;
    if (index === -1 || targetIndex < 0 || targetIndex >= siblings.length) return;
    const target = siblings[targetIndex];
    if (offset < 0) {
      parent.insertBefore(item, target);
    } else {
      parent.insertBefore(target, item);
    }
  }

  function updateServiceIndexes() {
    if (!serviceList) return;
    Array.from(serviceList.querySelectorAll("[data-service-item]")).forEach(function (item, idx) {
      const label = item.querySelector(".service-index");
      if (label) {
        label.textContent = String(idx + 1).padStart(2, "0");
      }
    });
  }

  function updateProcessSteps() {
    if (!processList) return;
    Array.from(processList.querySelectorAll("[data-process-item]")).forEach(function (item, idx) {
      const field = item.querySelector("[data-field='process-step']");
      if (field) {
        field.value = String(idx + 1).padStart(2, "0");
      }
    });
  }

  function updateCollectionNumbers() {
    if (!collectionItemList) return;
    Array.from(collectionItemList.querySelectorAll("[data-collection-item]")).forEach(function (item, idx) {
      const label = item.querySelector("[data-collection-number]");
      const title = item.querySelector("[data-collection-title]");
      const name = item.querySelector("[data-field='collection-name']");
      if (label) {
        label.textContent = `Collection ${idx + 1}`;
      }
      if (title && name) {
        title.textContent = name.value || "New Collection";
      }
    });
  }

  function updateCollectionPreview(item) {
    if (!item) return;
    const imageField = item.querySelector("[data-field='collection-image']");
    const preview = item.querySelector("[data-collection-image-preview]");
    const nameField = item.querySelector("[data-field='collection-name']");
    if (preview) {
      preview.src = imageField?.value || "";
      preview.alt = nameField?.value || "Collection preview";
    }
  }

  function setCollectionUploadStatus(item, message, isError) {
    const status = item?.querySelector("[data-collection-upload-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("text-red-300", Boolean(isError));
    status.classList.toggle("text-zinc-400", !isError);
  }

  async function uploadCollectionImage(item, file) {
    if (!item || !file) return;
    const collectionIdField = item.querySelector("[data-field='collection-id']");
    if (!collectionIdField) return;

    if (!collectionIdField.value) {
      collectionIdField.value = `collection-${Date.now()}`;
    }

    setCollectionUploadStatus(item, "Uploading...", false);
    setSaveStatus("Uploading image...", false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection_id", collectionIdField.value);

    try {
      const response = await fetch("/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Upload failed.");
      }

      const imageField = item.querySelector("[data-field='collection-image']");
      if (imageField) {
        imageField.value = result.url || "";
      }
      updateCollectionPreview(item);
      setCollectionUploadStatus(item, "Uploaded.", false);
      scheduleSave();
    } catch (error) {
      setCollectionUploadStatus(item, error.message || "Upload failed.", true);
      setSaveStatus(error.message || "Upload failed.", true);
    }
  }

  function createServiceItem(title, description) {
    const item = document.createElement("div");
    item.dataset.serviceItem = "";
    item.className = "space-y-2 rounded-xl border border-white/10 bg-black/40 p-4";
    item.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span class="service-index text-xs uppercase tracking-[0.18em] text-zinc-500">00</span>
        <button type="button" data-admin-action="delete-service" class="rounded-lg border border-red-400/60 px-3 py-1 text-xs uppercase tracking-[0.15em] text-red-200">Remove</button>
      </div>
      <input data-field="service-title" class="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none" />
      <input data-field="service-description" class="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none" />
    `;
    item.querySelector("[data-field='service-title']").value = title;
    item.querySelector("[data-field='service-description']").value = description;
    return item;
  }

  function createProcessItem(step, title, detail) {
    const item = document.createElement("div");
    item.dataset.processItem = "";
    item.className = "grid gap-3 rounded-xl border border-white/15 bg-black/50 p-4 md:grid-cols-[80px_1fr_1fr_auto]";
    item.innerHTML = `
      <input data-field="process-step" class="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none" />
      <input data-field="process-title" class="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none" />
      <input data-field="process-detail" class="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm outline-none" />
      <div class="grid gap-2">
        <button type="button" data-admin-action="move-up-process" class="rounded-lg border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.15em]">Up</button>
        <button type="button" data-admin-action="move-down-process" class="rounded-lg border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.15em]">Down</button>
        <button type="button" data-admin-action="delete-process" class="rounded-lg border border-red-400/60 px-4 py-2 text-xs uppercase tracking-[0.15em] text-red-200">Remove</button>
      </div>
    `;
    item.querySelector("[data-field='process-step']").value = step;
    item.querySelector("[data-field='process-title']").value = title;
    item.querySelector("[data-field='process-detail']").value = detail;
    return item;
  }

  function createCollectionItem(collection) {
    const item = document.createElement("div");
    item.dataset.collectionItem = "";
    item.className = "rounded-2xl border border-white/15 bg-black/40 p-5";
    item.innerHTML = `
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p data-collection-number class="text-xs uppercase tracking-[0.16em] text-zinc-400">Collection</p>
          <h3 data-collection-title class="font-display text-2xl uppercase tracking-[0.06em] text-white"></h3>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" data-admin-action="move-up-collection" class="rounded-lg border border-white/35 px-3 py-2 text-xs uppercase tracking-[0.16em]">Up</button>
          <button type="button" data-admin-action="move-down-collection" class="rounded-lg border border-white/35 px-3 py-2 text-xs uppercase tracking-[0.16em]">Down</button>
          <button type="button" data-admin-action="duplicate-collection" class="rounded-lg border border-white/35 px-3 py-2 text-xs uppercase tracking-[0.16em]">Duplicate</button>
          <button type="button" data-admin-action="delete-collection" class="rounded-lg border border-red-400/60 px-3 py-2 text-xs uppercase tracking-[0.16em] text-red-200">Delete</button>
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-2 mt-5">
        <input data-field="collection-id" type="hidden" />
        <label class="space-y-2">
          <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Name</span>
          <input data-field="collection-name" class="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none" />
        </label>
        <label class="space-y-2">
          <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Season</span>
          <input data-field="collection-season" class="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none" />
        </label>
        <label class="space-y-2 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Medium</span>
          <input data-field="collection-medium" class="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none" />
        </label>
        <label class="space-y-2 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Description</span>
          <textarea data-field="collection-note" rows="3" class="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none"></textarea>
        </label>
        <label class="space-y-2 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Image URL</span>
          <input data-field="collection-image" class="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-sm outline-none" />
        </label>
        <div class="space-y-2 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Image Upload</span>
          <div class="flex flex-wrap items-center gap-3">
            <input data-collection-file type="file" accept="image/*" class="hidden" />
            <button type="button" data-admin-action="upload-collection-image" class="rounded-lg border border-white/35 px-4 py-3 text-xs uppercase tracking-[0.16em]">Upload Image</button>
            <span data-collection-upload-status class="text-xs text-zinc-400"></span>
          </div>
        </div>
      </div>
      <div class="mt-4 overflow-hidden rounded-xl border border-white/15 bg-black/60">
        <img data-collection-image-preview class="h-48 w-full object-cover" />
      </div>
    `;
    item.querySelector("[data-field='collection-id']").value = collection.id;
    item.querySelector("[data-field='collection-name']").value = collection.name;
    item.querySelector("[data-field='collection-season']").value = collection.season;
    item.querySelector("[data-field='collection-medium']").value = collection.medium;
    item.querySelector("[data-field='collection-note']").value = collection.note;
    item.querySelector("[data-field='collection-image']").value = collection.image;
    item.querySelector("[data-collection-title]").textContent = collection.name || "New Collection";
    updateCollectionPreview(item);
    return item;
  }

  function handleContentInput(event) {
    const target = event.target;
    if (target.matches("[data-field='collection-name']")) {
      const item = target.closest("[data-collection-item]");
      const title = item?.querySelector("[data-collection-title]");
      if (title) {
        title.textContent = target.value || "New Collection";
      }
      updateCollectionPreview(item);
    }
    if (target.matches("[data-field='collection-image']")) {
      updateCollectionPreview(target.closest("[data-collection-item]"));
    }
    setSaveStatus("Unsaved changes.", false);
  }

  document.body.addEventListener("click", async function (event) {
    const button = event.target.closest("[data-admin-action]");
    if (!button) return;
    const action = button.dataset.adminAction;
    const item = button.closest("[data-service-item], [data-process-item], [data-collection-item]");

    switch (action) {
      case "add-service":
        if (serviceList) {
          serviceList.appendChild(createServiceItem("New Service", "Service description."));
          updateServiceIndexes();
          scheduleSave();
        }
        break;
      case "delete-service":
        if (item) {
          item.remove();
          updateServiceIndexes();
          scheduleSave();
        }
        break;
      case "add-process":
        if (processList) {
          const step = String(processList.children.length + 1).padStart(2, "0");
          processList.appendChild(createProcessItem(step, "New process step", "Describe this new process step."));
          updateProcessSteps();
          scheduleSave();
        }
        break;
      case "delete-process":
        if (item) {
          item.remove();
          updateProcessSteps();
          scheduleSave();
        }
        break;
      case "move-up-process":
        if (item) {
          swapListItem(item, -1);
          updateProcessSteps();
          scheduleSave();
        }
        break;
      case "move-down-process":
        if (item) {
          swapListItem(item, 1);
          updateProcessSteps();
          scheduleSave();
        }
        break;
      case "add-collection":
        if (collectionItemList) {
          collectionItemList.appendChild(createCollectionItem({
            id: `new-collection-${Date.now()}`,
            name: "New Collection",
            season: "SS00",
            image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
            note: "Add a description for this collection.",
            medium: "Medium details",
          }));
          updateCollectionNumbers();
          scheduleSave();
        }
        break;
      case "delete-collection":
        if (item) {
          item.remove();
          updateCollectionNumbers();
          scheduleSave();
        }
        break;
      case "move-up-collection":
        if (item) {
          swapListItem(item, -1);
          updateCollectionNumbers();
          scheduleSave();
        }
        break;
      case "move-down-collection":
        if (item) {
          swapListItem(item, 1);
          updateCollectionNumbers();
          scheduleSave();
        }
        break;
      case "duplicate-collection":
        if (item && collectionItemList) {
          const clone = item.cloneNode(true);
          clone.querySelector("[data-field='collection-id']").value = `copy-${Date.now()}`;
          const fileInput = clone.querySelector("[data-collection-file]");
          if (fileInput) {
            fileInput.value = "";
          }
          setCollectionUploadStatus(clone, "", false);
          updateCollectionPreview(clone);
          collectionItemList.insertBefore(clone, item.nextSibling);
          updateCollectionNumbers();
          scheduleSave();
        }
        break;
      case "upload-collection-image":
        if (item) {
          item.querySelector("[data-collection-file]")?.click();
        }
        break;
      default:
        return;
    }
  });

  document.body.addEventListener("input", function (event) {
    if (event.target.matches("[data-field]")) {
      handleContentInput(event);
      scheduleSave();
    }
  });

  document.body.addEventListener("change", function (event) {
    if (event.target.matches("[data-collection-file]")) {
      const item = event.target.closest("[data-collection-item]");
      const file = event.target.files && event.target.files[0];
      if (file) {
        uploadCollectionImage(item, file);
      }
      event.target.value = "";
    }
  });

  if (collectionItemList) {
    Array.from(collectionItemList.querySelectorAll("[data-collection-item]")).forEach(function (item) {
      updateCollectionPreview(item);
    });
    updateCollectionNumbers();
  }
});
