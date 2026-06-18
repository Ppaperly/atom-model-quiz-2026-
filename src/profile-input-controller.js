import {normalizeStudentProfile} from "./profile-utils.js";

const PROFILE_FIELDS=["gradeName","className","teamName","studentNumber","studentName"];

document.addEventListener("submit",event=>{
  const form=event.target;
  if(!(form instanceof HTMLFormElement)||form.id!=="startForm")return;
  try{
    const profile=normalizeStudentProfile(Object.fromEntries(PROFILE_FIELDS.map(name=>[name,form.elements.namedItem(name)?.value])));
    PROFILE_FIELDS.forEach(name=>{const input=form.elements.namedItem(name);if(input)input.value=profile[name];});
  }catch(error){
    event.preventDefault();
    event.stopImmediatePropagation();
    const messageBox=document.querySelector("#messageBox");
    if(messageBox){messageBox.textContent=error.message;messageBox.classList.add("danger-text");}
  }
},true);

function removeDuplicateNumberUnits(root){
  if(root.nodeType===Node.TEXT_NODE){root.nodeValue=root.nodeValue.replace(/번번/g,"번");return;}
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode()))node.nodeValue=node.nodeValue.replace(/번번/g,"번");
}

const observer=new MutationObserver(mutations=>mutations.forEach(mutation=>mutation.addedNodes.forEach(removeDuplicateNumberUnits)));
observer.observe(document.documentElement,{childList:true,subtree:true});
