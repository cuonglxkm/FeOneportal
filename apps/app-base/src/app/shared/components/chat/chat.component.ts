import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { fnGetRandomNum } from '@app/utils/tools';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  @Output() readonly changeShows = new EventEmitter<boolean>();
  validateForm!: FormGroup;
  messageArray: Array<{ msg: string; dir: 'left' | 'right'; isReaded: boolean }> = [];
  isSending = false;
  show = false;
  randomReport: string[] = [
    "Sorry I'm not here right now, I don't want to talk to you later",
    "Hello, send a one-yuan red envelope to automatically unlock the chat mode",
    "Hello, I'm not bored now, I hope you can find me again when bored",
    "Your cutie is rushing to your chat interface in eight hundred miles",
    "The Fairy Castle woke up and returned to you",
    "Gulu Gulu Magic Fairy Castle special line is connecting for you",
    "don't bother me oh I'm bubbling Oooooo",
    "Papa Antique Shop, please leave a message if you have anything",
    "I didn't reply, I just went to pull the carrots Ooo",
    "I don't like to reply messages, I feel like I was a do-not-disturb in my previous life",
    "Press 1 for manual service",
    "Currently Xindong is sold out, welcome to visit next time",
    "Go to the universe to pick up stars, come back soon",
    "don't look for me, make money if you have something to do",
    "Hello, I am an automatic reply, your chat partner is temporarily absent",
    "You can chat with me, but I only know this sentence",
    "What are you doing, I am your Grandpa Niu",
    "Congratulations on unlocking my little cutie",
    "I'm going to buy some oranges, you stay here, don't move around",
    "I'm going to be Xizhilang, come back and bring spacemen to you",
    "The other party is trying to connect with you, please wait a moment, the current progress is 1 %",
    "Oh my god, my brain hurts, my brain hurts, I don't have money to pay Internet fees, my brain hurts",
    "Welcome to the Sand Sculpture Service Hotline, press 1 for manual chat, press 2 for voice chat, and press 3 for video chat",
    "Recovery skill cooldown",
    "Your message has been delivered, but the other party has received it, but will not reply",
    "Sorry, the user you contacted is too good",
    "It has been deleted by Tencent, please contact 10086 for more details",
    "Wait for me, I will use Fang Tian's painting halberd to peel an apple for you later",
    "Please enter 520 times I love you to call me",
    "If you don't reply to the message, you are herding the sheep. If you don't reply all the time, the sheep is lost",
    "Because of leaking the ancestral secret recipe of Krab King, the Marine Supervision Bureau has captured her, and she will contact you when she is released",
    "Well, you keep talking, I'm listening",
    "You are the beauty limited to summer",
    "Will reply within the appreciation period",
    "On the way to make an appointment with you",
    "Hey, this is the Krab King restaurant in Bikini Beach, I'm frying the meatloaf in the super crab burger,",
    "If you need anything, please find Brother Octopus, beep beep beep",
    "XX and I went to be astronauts, come back to catch aliens for you",
    "Drowning in the ocean of learning",
    "I went to the back mountain with the old demon of Montenegro to discuss the matter of eating Tang Seng, and we will talk about it when we come back. ",
    "What are you doing?",
    "You speak up! I can not hear! ",
    "If you don't go back, you are in the canyon",
    "If you don't come back, you will be buried in the canyon",
    "If you don't reply, you are eating chicken",
    "If you don't come back, you will be eaten by chickens",
    "I went to the universe",
    "Come back and pick the stars for you",
    "Hello",
    "Our boss is saving the galaxy",
    "Come back after defeating the monster",
    "You'll see him later",
    "The master said she needed a packet of tomato chips to track her",
    "Fish, the pond master went out to cast a net and came back to pamper you",
    "What's the matter, we'll talk about it at night, the kindergarten is not over yet",
    "Guest officer, please wait a moment, the master is on his way",
    "If you don't reply to a message, you are begging for food",
    "Please shout three times for beauty, I will appear immediately, if there is no response, it means that you are not sincere, please shout three more times, and so on",
    "thanks",
    "Your friend is offline, please contact after transferring money",
    "Sorry, the other party is too cute,",
    "There is something in line to make an appointment",
    "I'm basking in the sun don't bother me",
    "There is an inner ghost, it is not convenient to reply now",
    "in the bath",
    "The other party has been poisoned, send I love you to detoxify",
    "The other party's network is unstable, please try again later",
    "I'll come down to earth to meet you ordinary people later",
    "Retreating and practicing"
  ];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    console.log('The customer service function is destroyed');
  }

  close(): void {
    this.changeShows.emit(false);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch (err) {}
    });
  }

  clearMsgInput(): void {
    setTimeout(() => {
      this.validateForm.get('question')?.reset();
    });
  }

  sendMessage(msg: string, event: Event): void {
    if (!msg.trim()) {
      event.preventDefault();
      event.stopPropagation();
      this.clearMsgInput();
      return;
    }
    this.messageArray.push({ msg, dir: 'right', isReaded: false });
    this.clearMsgInput();

    setTimeout(() => {
      this.isSending = true;
      this.messageArray.forEach(item => {
        if (item.dir === 'right') {
          item.isReaded = true;
        }
      });
      this.cdr.markForCheck();
    }, 1000);

    setTimeout(() => {
      const index = fnGetRandomNum(0, this.randomReport.length);
      this.messageArray.push({ msg: this.randomReport[index], dir: 'left', isReaded: false });

      this.isSending = false;
      this.scrollToBottom();
      this.cdr.detectChanges();
    }, 3000);
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      question: [null]
    });
    this.scrollToBottom();
  }
}
