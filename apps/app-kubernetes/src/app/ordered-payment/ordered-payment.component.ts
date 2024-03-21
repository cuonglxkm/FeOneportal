import { Component, OnInit } from '@angular/core';
import { ClusterService } from '../services/cluster.service';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-ordered-payment',
  templateUrl: './ordered-payment.component.html',
  styleUrls: ['./ordered-payment.component.css'],
})
export class OrderedPaymentComponent implements OnInit {

  isSubmitting: boolean;
  isAgreeWithTerm: boolean;

  constructor(
    private clusterService: ClusterService,
    private router: Router
  ) {
    this.isAgreeWithTerm = false;
    this.isSubmitting = false;
  }

  ngOnInit(): void {

  }

  goBack() {
    this.router.navigate(['/app-kubernetes']);
  }

  handleChooseDiscount() {}

  onSubmitPayment() {}

}
